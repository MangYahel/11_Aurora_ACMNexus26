from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_model import analyze_session

app = Flask(__name__)
CORS(app) # 👈 THIS fixes CORS

@app.route("/")
def home():
    return jsonify({"message": "GhostTrace X Backend Running Successfully"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    result = analyze_session(data)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)