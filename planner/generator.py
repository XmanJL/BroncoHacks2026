from planner.constraints import parse_user_constraints
from planner.split import choose_split
from planner.filters import filter_exercises
from planner.prescription import build_exercise_output, get_exercise_time_minutes
from planner.day_requirements import DAY_REQUIREMENTS, get_time_band


def assign_day_focuses(active_days, split):
    scheduled_days = []

    for i, day in enumerate(active_days):
        if i >= len(split):
            break

        scheduled_days.append({
            "index": day["index"],
            "day": day["name"],
            "minutes": day["minutes"],
            "focus": split[i],
        })

    return scheduled_days


def choose_candidate(candidates, used_today, used_week):
    """
    Prefer exercises not used this week and not used today.
    If none exist, allow week repeats but still avoid same-day repeats.
    """
    for _, row in candidates.iterrows():
        name = row.get("name_display")
        if name not in used_today and name not in used_week:
            return row

    for _, row in candidates.iterrows():
        name = row.get("name_display")
        if name not in used_today:
            return row

    return None


def get_allowed_body_parts_for_day(focus, minutes):
    time_band = get_time_band(minutes)
    requirements = DAY_REQUIREMENTS.get(focus, {}).get(time_band, {})
    return requirements


def count_exercises_by_category(exercises):
    counts = {}

    for ex in exercises:
        category = ex.get("planner_category")
        if category:
            counts[category] = counts.get(category, 0) + 1

    return counts


def get_category_candidates(filtered_df, category):
    target_series = filtered_df["target_raw"].fillna("").str.lower()
    body_series = filtered_df["body_part_group"].fillna("").str.lower()

    if category == "chest":
        return filtered_df[body_series == "chest"]

    if category == "shoulders":
        return filtered_df[body_series == "shoulders"]

    if category == "triceps":
        return filtered_df[
            (body_series == "upper arms") &
            (target_series.str.contains("tricep", na=False))
        ]

    if category == "back":
        return filtered_df[body_series == "back"]

    if category == "biceps":
        return filtered_df[
            (body_series == "upper arms") &
            (
                target_series.str.contains("bicep", na=False) |
                target_series.str.contains("brach", na=False)
            )
        ]

    if category == "forearms":
        return filtered_df[
            (body_series == "lower arms") |
            (target_series.str.contains("forearm", na=False))
        ]

    if category == "upper legs":
        return filtered_df[body_series == "upper legs"]

    if category == "lower legs":
        return filtered_df[body_series == "lower legs"]

    if category == "waist":
        return filtered_df[body_series == "waist"]

    if category == "cardio":
        return filtered_df[body_series == "cardio"]

    if category == "neck":
        return filtered_df[body_series == "neck"]

    return filtered_df.iloc[0:0]


def build_day_plan(day_info, filtered_df, difficulty, weekly_used_names):
    focus = day_info["focus"]
    target_minutes = day_info["minutes"]

    requirements = get_allowed_body_parts_for_day(focus, target_minutes)

    used_today = set()
    exercises = []
    estimated_minutes = 0.0

    # PASS 1:
    # satisfy minimum category counts for this day type and time band
    for category, required_count in requirements.items():
        candidates = get_category_candidates(filtered_df, category)

        for _ in range(required_count):
            row = choose_candidate(candidates, used_today, weekly_used_names)
            if row is None:
                break

            exercise_time = get_exercise_time_minutes(row, difficulty)
            if estimated_minutes + exercise_time > target_minutes:
                break

            exercise_output = build_exercise_output(row, difficulty)
            exercise_output["planner_category"] = category
            exercises.append(exercise_output)

            exercise_name = exercise_output["name_display"]
            used_today.add(exercise_name)
            estimated_minutes += exercise_time

            candidates = candidates[candidates["name_display"] != exercise_name]

    # PASS 2:
    # fill remaining time, but do not let one category dominate
    allowed_categories = list(requirements.keys())

    while estimated_minutes < target_minutes * 0.85:
        added_any = False
        category_counts = count_exercises_by_category(exercises)

        for category in allowed_categories:
            current_count = category_counts.get(category, 0)
            required_count = requirements.get(category, 0)

            # Do not let one category keep growing way past its intended size
            if current_count >= required_count + 1:
                continue

            candidates = get_category_candidates(filtered_df, category)

            row = choose_candidate(candidates, used_today, weekly_used_names)
            if row is None:
                continue

            exercise_time = get_exercise_time_minutes(row, difficulty)
            if estimated_minutes + exercise_time > target_minutes:
                continue

            exercise_output = build_exercise_output(row, difficulty)
            exercise_output["planner_category"] = category
            exercises.append(exercise_output)

            exercise_name = exercise_output["name_display"]
            used_today.add(exercise_name)
            estimated_minutes += exercise_time
            added_any = True

            category_counts[category] = category_counts.get(category, 0) + 1

        if not added_any:
            break

    # Optional: remove internal planner field before returning to frontend
    for exercise in exercises:
        exercise.pop("planner_category", None)

    return {
        "day": day_info["day"],
        "focus": focus,
        "targetMinutes": target_minutes,
        "estimatedMinutes": round(estimated_minutes, 1),
        "exercises": exercises,
    }


def build_week_plan(payload, df):
    constraints = parse_user_constraints(payload)

    split = choose_split(
        constraints["day_count"],
        constraints["avg_minutes"],
        constraints["difficulty"],
    )

    scheduled_days = assign_day_focuses(constraints["active_days"], split)
    filtered_df = filter_exercises(df, constraints)

    days = []
    weekly_used_names = set()

    for day_info in scheduled_days:
        day_plan = build_day_plan(
            day_info=day_info,
            filtered_df=filtered_df,
            difficulty=constraints["difficulty"],
            weekly_used_names=weekly_used_names,
        )

        days.append(day_plan)

        for exercise in day_plan["exercises"]:
            weekly_used_names.add(exercise["name_display"])

    return {
        "weeklySummary": {
            "difficulty": constraints["difficulty"],
            "days": constraints["day_count"],
            "totalMinutes": constraints["total_minutes"],
            "avgMinutes": constraints["avg_minutes"],
            "split": split,
        },
        "days": days,
    }