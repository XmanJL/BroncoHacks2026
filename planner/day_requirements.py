def get_time_band(minutes):
    if minutes < 35:
        return "short"
    if minutes < 60:
        return "medium"
    return "long"


DAY_REQUIREMENTS = {
    "push": {
        "short": {
            "chest": 1,
            "shoulders": 1,
            "triceps": 1,
        },
        "medium": {
            "chest": 2,
            "shoulders": 1,
            "triceps": 1,
        },
        "long": {
            "chest": 2,
            "shoulders": 2,
            "triceps": 2,
        },
    },
    "pull": {
        "short": {
            "back": 1,
            "biceps": 1,
            "forearms": 1,
        },
        "medium": {
            "back": 2,
            "biceps": 1,
            "forearms": 1,
        },  
        "long": {
            "back": 2,
            "biceps": 2,
            "forearms": 1,
        },
    },
    "legs": {
        "short": {"upper_legs": 1, "lower_legs": 1, "core": 1},
        "medium": {"upper_legs": 2, "lower_legs": 1, "core": 1},
        "long": {"upper_legs": 2, "lower_legs": 2, "core": 1, "cardio": 1},
    },
    "upper": {
        "short": {"chest": 1, "back": 1, "shoulders": 1},
        "medium": {"chest": 1, "back": 1, "shoulders": 1, "biceps": 1},
        "long": {"chest": 2, "back": 2, "shoulders": 1, "biceps": 1, "triceps": 1},
    },
    "lower": {
        "short": {"upper_legs": 1, "lower_legs": 1, "core": 1},
        "medium": {"upper_legs": 2, "lower_legs": 1, "core": 1},
        "long": {"upper_legs": 2, "lower_legs": 2, "core": 1, "cardio": 1},
    },
    "full_body": {
        "short": {"upper_legs": 1, "chest": 1, "back": 1, "core": 1},
        "medium": {"upper_legs": 1, "chest": 1, "back": 1, "shoulders": 1, "core": 1},
        "long": {"upper_legs": 2, "chest": 2, "back": 2, "shoulders": 1, "core": 1},
    },
}

DAY_MAXIMUMS = {
    "push": {
        "short": {"chest": 2, "shoulders": 2, "triceps": 2},
        "medium": {"chest": 3, "shoulders": 2, "triceps": 2},
        "long": {"chest": 3, "shoulders": 3, "triceps": 3},
    },
    "pull": {
        "short": {"back": 2, "biceps": 2, "forearms": 2},
        "medium": {"back": 3, "biceps": 2, "forearms": 2, "neck": 1},
        "long": {"back": 3, "biceps": 3, "forearms": 2, "neck": 2},
    },
    "legs": {
        "short": {"upper_legs": 2, "lower_legs": 2, "core": 2},
        "medium": {"upper_legs": 3, "lower_legs": 2, "core": 2, "cardio": 1},
        "long": {"upper_legs": 3, "lower_legs": 3, "core": 2, "cardio": 2},
    },
}