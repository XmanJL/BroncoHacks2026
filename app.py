from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from planner.generator import build_week_plan

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

EXERCISES_DF = pd.read_csv("exercises_cleaned.csv")

@app.route("/api/schedule", methods=["POST"])
def get_plan():
    payload = request.json or {}
    plan = build_week_plan(payload, EXERCISES_DF)
    return jsonify(plan)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)