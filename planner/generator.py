from planner.constraints import parse_user_constraints
from planner.split import choose_split
from planner.mappings import FOCUS_TARGETS
from planner.filters import filter_exercises
from planner.prescription import build_exercise_output, get_exercise_time_minutes

def assign_day_focuses(active_days, split):
    scheduled_days = []

    for i, day in enumerate(active_days):
        if i >= len(split):
            break

        focus = split[i]

        scheduled_days.append({
            "index": day["index"],
            "day": day["name"],
            "minutes": day["minutes"],
            "focus": focus,
            "body_part_targets": FOCUS_TARGETS.get(focus, []),
        })

    return scheduled_days

def build_day_plan(day_info, filtered_df, difficulty):
    focus = day_info["focus"]
    target_minutes = day_info["minutes"]
    body_part_targets = day_info["body_part_targets"]

    used_names = set()
    exercises = []
    estimated_minutes = 0.0

    for body_part in body_part_targets:
        candidates = filtered_df[filtered_df["body_part_group"] == body_part]

        # Simple target_raw diversification:
        # prefer the first exercise not already used
        for _, row in candidates.iterrows():
            exercise_name = row.get("name_display")

            if exercise_name in used_names:
                continue

            exercise_time = get_exercise_time_minutes(row, difficulty)

            if estimated_minutes + exercise_time > target_minutes:
                continue

            exercise_output = build_exercise_output(row, difficulty)
            exercises.append(exercise_output)

            used_names.add(exercise_name)
            estimated_minutes += exercise_time
            break

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
    for day_info in scheduled_days:
        day_plan = build_day_plan(day_info, filtered_df, constraints["difficulty"])
        days.append(day_plan)

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