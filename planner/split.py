def choose_split(day_count, avg_minutes, difficulty):
    difficulty = (difficulty or "beginner").strip().lower()

    if day_count <= 0:
        return []

    if day_count == 1:
        return ["full_body"]

    if day_count == 2:
        return ["upper", "lower"]

    if day_count == 3:
        if difficulty == "beginner" or avg_minutes < 40:
            return ["full_body", "full_body", "full_body"]
        return ["push", "pull", "legs"]

    if day_count == 4:
        return ["upper", "lower", "upper", "lower"]

    if day_count == 5:
        return ["push", "pull", "legs", "upper", "lower"]

    if day_count == 6:
        return ["push", "pull", "legs", "push", "pull", "legs"]

    return ["push", "pull", "legs", "upper", "lower", "full_body_light", "recovery"]