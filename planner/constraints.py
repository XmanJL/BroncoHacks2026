DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

ALL_BODY_PARTS = [
    "chest",
    "shoulders",
    "back",
    "upper arms",
    "lower arms",
    "neck",
    "upper legs",
    "lower legs",
    "waist",
    "cardio",
]

def get_active_days(duration_minutes):
    active_days = []

    for i, minutes in enumerate(duration_minutes):
        if minutes is not None and minutes > 0:
            active_days.append({
                "index": i,
                "name": DAY_NAMES[i],
                "minutes": int(minutes),
            })

    return active_days

def parse_user_constraints(payload):
    duration_minutes = payload.get("durationMinutes", [])
    active_days = get_active_days(duration_minutes)

    difficulty = (payload.get("difficulty") or "beginner").strip().lower()
    equipment = payload.get("equipment") or ["body weight"]
    target_muscles = payload.get("muscleGroups") or ALL_BODY_PARTS

    day_count = len(active_days)
    total_minutes = sum(day["minutes"] for day in active_days)
    avg_minutes = total_minutes / day_count if day_count > 0 else 0

    return {
        "difficulty": difficulty,
        "equipment": equipment,
        "target_muscles": target_muscles,
        "active_days": active_days,
        "day_count": day_count,
        "total_minutes": total_minutes,
        "avg_minutes": avg_minutes,
    }