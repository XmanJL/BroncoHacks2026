from http import HTTPStatus

import pandas as pd
from flask import Flask, request
import json
from flask import Response
from flask_cors import CORS

unFilteredDf = pd.read_csv("exercises_cleaned.csv")
unCleanedDf = pd.read_csv("exercises.csv")

fullBodyParts = [
    'waist',
    'upper_legs', 'upper legs',
    'back',
    'lower_legs', 'lower legs',
    'chest',
    'upper_arms', 'upper arms',
    'cardio',
    'shoulders',
    'lower_arms', 'lower arms',
    'neck'
]

upperBodyParts = [
    'back',
    'chest',
    'shoulders',
    'upper_arms', 'upper arms',
    'lower_arms', 'lower arms',
    'neck'
]

lowerBodyParts = [
    'waist',
    'upper_legs', 'upper legs',
    'lower_legs', 'lower legs',
    'cardio'
]

push = [
    'chest',
    'shoulders',
    'upper_arms', 'upper arms'
]

pull = [
    'back',
    'upper_arms', 'upper arms',
    'lower_arms', 'lower arms',
    'neck'
]

legs = [
    'upper_legs', 'upper legs',
    'lower_legs', 'lower legs',
    'waist'
]

equipment = [
    "body_weight", "body weight",
    "cable",
    "leverage_machine", "leverage machine",
    "assisted",
    "medicine_ball", "medicine ball",
    "stability_ball", "stability ball",
    "band",
    "barbell",
    "rope",
    "dumbbell",
    "ez_barbell", "ez barbell",
    "sled_machine", "sled machine",
    "upper_body_ergometer", "upper body ergometer",
    "kettlebell",
    "olympic_barbell", "olympic barbell",
    "weighted",
    "bosu_ball", "bosu ball",
    "resistance_band", "resistance band",
    "roller",
    "skierg_machine", "skierg machine",
    "hammer",
    "smith_machine", "smith machine",
    "wheel_roller", "wheel roller",
    "stationary_bike", "stationary bike",
    "tire",
    "trap_bar", "trap bar",
    "elliptical_machine", "elliptical machine",
    "stepmill_machine", "stepmill machine"
]

df = unFilteredDf
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


with open("user.json") as file:
    userDict = json.loads(file.read())

def getExerciseById(id):
    exerciseId = int(id)
    exercise = unCleanedDf[unCleanedDf["id"] == exerciseId].fillna(value='-1').to_dict()
    return exercise


@app.route("/", methods=['GET', 'POST'])
def getPlan():

    json = request.json

    level = json["difficulty"]
    muscleGroups = json["muscleGroups"]
    equipment = json["equipment"]

    dfMuscle = unFilteredDf[unFilteredDf["body_part_group"].isin(muscleGroups)]
    dfEquip = dfMuscle[dfMuscle["equipment_raw"].isin(equipment)]

    days = json["durationMinutes"]

    # Filter by level
    if level == 'beginner':
        df = dfEquip[unFilteredDf["experience_min"] == "beginner"]
    elif level == 'intermediate':
        df = dfEquip[
            (dfEquip["experience_min"] == "intermediate") |
            (dfEquip["experience_min"] == "beginner")
            ]
    elif level == 'advanced':
        df = dfEquip
    else:
        df = dfEquip


    exerciseDays = []
    i = 0
    for day in days:
        if day is not None:
            exerciseDays.append(i)
        i += 1

    dayCount = len(exerciseDays)


    # Create 1D array of day objects

    exercises = [{"day": i + 1, "exercises": []} for i in range(7)]

    def add_parts_to_day(day_index, parts):

        for part in parts:

            matching_exercises = df[df["body_part_raw"] == part].to_dict('records')
            instruct_exer = []

            for matching_exercise in matching_exercises:
                instruct_exer.append(getExerciseById(matching_exercise['id']) | matching_exercise)

            matching_exercises = instruct_exer

            if len(matching_exercises) > 3:
                for i in range(3):
                    exercises[day_index]["exercises"].append((matching_exercises[i]))
            else:
                for i in range(len(matching_exercises)):
                    exercises[day_index]["exercises"].append(matching_exercises[i])


    if dayCount == 1:
        add_parts_to_day(exerciseDays[0], lowerBodyParts)

    elif dayCount == 2:
        add_parts_to_day(exerciseDays[0], upperBodyParts)
        add_parts_to_day(exerciseDays[0], lowerBodyParts)

    elif dayCount == 3:
        add_parts_to_day(exerciseDays[0], push)
        add_parts_to_day(exerciseDays[1], pull)
        add_parts_to_day(exerciseDays[2], legs)

    elif dayCount == 4:
        add_parts_to_day(exerciseDays[0], upperBodyParts)
        add_parts_to_day(exerciseDays[1], lowerBodyParts)
        add_parts_to_day(exerciseDays[2], upperBodyParts)
        add_parts_to_day(exerciseDays[3], lowerBodyParts)

    elif dayCount == 5:
        add_parts_to_day(exerciseDays[0], push)
        add_parts_to_day(exerciseDays[1], pull)
        add_parts_to_day(exerciseDays[2], legs)
        add_parts_to_day(exerciseDays[3], upperBodyParts)
        add_parts_to_day(exerciseDays[4], lowerBodyParts)
    elif dayCount == 6:
        add_parts_to_day(exerciseDays[0], push)
        add_parts_to_day(exerciseDays[1], pull)
        add_parts_to_day(exerciseDays[2], legs)
        add_parts_to_day(exerciseDays[3], upperBodyParts)
        add_parts_to_day(exerciseDays[4], lowerBodyParts)
        add_parts_to_day(exerciseDays[5], push)
    elif dayCount == 7:
        add_parts_to_day(0, push)
        add_parts_to_day(1, pull)
        add_parts_to_day(2, legs)
        add_parts_to_day(3, upperBodyParts)
        add_parts_to_day(4, lowerBodyParts)
        add_parts_to_day(5, push)
        add_parts_to_day(6, pull)

    return exercises

@app.route("/<bodyPart>/<equipment>")
def searchByBodyPart(bodyPart, equipment):

    filteredByBodyPart = df[df["body_part_group"] == bodyPart]

    json = filteredByBodyPart[filteredByBodyPart["equipment_raw"] == equipment].to_json(orient='records', lines=True)
    return json


@app.route("/completed/<exerciseId>")
def levelUp(exerciseId):
    exerciseId = int(exerciseId)
    exercise = df[df["id"] == exerciseId]
    userDict["level"][exercise.iloc[0]["target_raw"]] += 100

    with open('user.json', "w") as fp:
        json.dump(userDict, fp)

    return Response(status=200)


@app.route("/user/levels")
def getUserLevels():

    return userDict


@app.route("/exercise/<id>")
def displayExerciseById(id):
    exerciseId = int(id)
    exercise = unCleanedDf[unCleanedDf["id"] == exerciseId].fillna(value='-1').to_dict()
    print(type(exercise))
    return exercise


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

