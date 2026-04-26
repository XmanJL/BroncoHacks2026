def get_sets_column(difficulty):
    return f"defaultsets{difficulty}"

def get_reps_column(difficulty):
    return f"defaultreps{difficulty}"

def parse_sets_value(value, fallback=3):
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback

def parse_time_per_set(value, fallback=45):
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback

def get_rest_seconds(difficulty, body_part_group):
    if body_part_group in ["chest", "back", "upper legs", "lower legs", "shoulders"]:
        if difficulty == "beginner":
            return 75
        if difficulty == "intermediate":
            return 90
        return 120
    return 45

def get_exercise_time_minutes(row, difficulty):
    sets_col = get_sets_column(difficulty)

    sets_value = parse_sets_value(row.get(sets_col), 3)
    time_per_set_sec = parse_time_per_set(row.get("time_per_set_sec"), 45)
    rest_seconds = get_rest_seconds(difficulty, row.get("body_part_group"))

    total_seconds = (sets_value * time_per_set_sec) + ((sets_value - 1) * rest_seconds)
    return round(total_seconds / 60, 1)

def build_exercise_output(row, difficulty):
    sets_col = get_sets_column(difficulty)
    reps_col = get_reps_column(difficulty)

    sets_value = parse_sets_value(row.get(sets_col), 3)
    reps_value = row.get(reps_col, "8-12")
    time_value = get_exercise_time_minutes(row, difficulty)

    return {
        "name_display": row.get("name_display"),
        "body_part_group": row.get("body_part_group"),
        "target_raw": row.get("target_raw"),
        "equipment_group": row.get("equipment_group"),
        "sets": sets_value,
        "reps": reps_value,
        "time": time_value,
    }