from http import HTTPStatus

import pandas as pd
from flask import Flask, request
from flask_cors import CORS
import json
from flask import Response

unFilteredDf = pd.read_csv("exercises_cleaned.csv")


fullBodyParts = ['waist', 'upper legs', 'back', 'lower legs', 'chest', 'upper arms', 'cardio','shoulders', 'lower arms', 'neck']
upperBodyParts = ['back', 'chest', 'shoulders', 'upper arms', 'lower arms', 'neck']
lowerBodyParts = ['waist', 'upper legs', 'lower legs', 'cardio']
push = ['chest', 'shoulders', 'upper arms']
pull = ['back', 'upper arms', 'lower arms', 'neck']
legs = ['upper legs', 'lower legs', 'waist']
equipment = ["body weight", "cable", "leverage machine", "assisted", "medicine ball", "stability ball", "band", "barbell", "rope", "dumbbell", "ez barbell", "sled machine", "upper body ergometer", "kettlebell", "olympic barbell", "weighted", "bosu ball", "resistance band", "roller", "skierg machine", "hammer", "smith machine", "wheel roller", "stationary bike", "tire", "trap bar", "elliptical machine", "stepmill machine"]
df = unFilteredDf
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
with open("user.json") as file:
    userDict = json.loads(file.read())

@app.route("/api/schedule", methods=['GET', 'POST'])
def getPlan():

    json = request.json

    level = json["difficulty"]

    muscleGroups = json["muscleGroups"]
    equipment = json["equipment"]

    dfMuscle = unFilteredDf[unFilteredDf["body_part_group"].isin(muscleGroups)]
    dfEquip = dfMuscle[dfMuscle["equipment_group"].isin(equipment)]

    dayCount = len(json["durationMinutes"])

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

    # Create 1D array of day objects
    exercises = [{"day": i + 1, "exercises": []} for i in range(dayCount)]

    def add_parts_to_day(day_index, parts):
        for part in parts:
            matching_exercises = df[df["body_part_group"] == part].values.tolist()

            if len(matching_exercises) > 3:
                for i in range(3):
                    exercises[day_index]["exercises"].append(matching_exercises[i])
            else:
                exercises[day_index]["exercises"].extend(matching_exercises)

    if dayCount == 1:
        add_parts_to_day(0, fullBodyParts)

    elif dayCount == 2:
        add_parts_to_day(0, upperBodyParts)
        add_parts_to_day(1, lowerBodyParts)

    elif dayCount == 3:
        add_parts_to_day(0, push)
        add_parts_to_day(1, pull)
        add_parts_to_day(2, legs)

    elif dayCount == 4:
        add_parts_to_day(0, upperBodyParts)
        add_parts_to_day(1, lowerBodyParts)
        add_parts_to_day(2, upperBodyParts)
        add_parts_to_day(3, lowerBodyParts)

    elif dayCount == 5:
        add_parts_to_day(0, push)
        add_parts_to_day(1, pull)
        add_parts_to_day(2, legs)
        add_parts_to_day(3, upperBodyParts)
        add_parts_to_day(4, lowerBodyParts)
    elif dayCount == 6:
        add_parts_to_day(0, push)
        add_parts_to_day(1, pull)
        add_parts_to_day(2, legs)
        add_parts_to_day(3, upperBodyParts)
        add_parts_to_day(4, lowerBodyParts)
        add_parts_to_day(5, push)
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

    json = filteredByBodyPart[filteredByBodyPart["equipment_group"] == equipment].to_json(orient='records', lines=True)
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
    exercise = df[df["id"] == exerciseId]

    return exercise.to_dict()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)





