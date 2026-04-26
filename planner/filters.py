def filter_exercises(df, constraints):
    filtered = df.copy()

    equipment = constraints["equipment"]
    difficulty = constraints["difficulty"]

    filtered = filtered[filtered["equipment_group"].isin(equipment)]

    if difficulty == "beginner":
        filtered = filtered[filtered["experience_min"] == "beginner"]
    elif difficulty == "intermediate":
        filtered = filtered[
            filtered["experience_min"].isin(["beginner", "intermediate"])
        ]

    return filtered