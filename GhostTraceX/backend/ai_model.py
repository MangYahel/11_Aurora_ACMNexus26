import pandas as pd
from sklearn.ensemble import IsolationForest

# Load training data
df = pd.read_csv("data.csv")

# Features used for AI
FEATURES = [
    "login_hour",
    "files_accessed",
    "download_size",
    "location_code",
    "device_code",
    "department_code"
]

# Train model
model = IsolationForest(contamination=0.15, random_state=42)
model.fit(df[FEATURES])


def calculate_risk(session):
    risk = 0

    if session["login_hour"] < 6 or session["login_hour"] > 20:
        risk += 20

    if session["files_accessed"] > 50:
        risk += 20

    if session["download_size"] > 200:
        risk += 20

    if session["location_code"] != 1:
        risk += 15

    if session["device_code"] != 1:
        risk += 10

    if session["department_code"] not in [1, 2, 3]:
        risk += 15

    return min(risk, 100)


def explain_session(session):
    reasons = []

    if session["login_hour"] < 6 or session["login_hour"] > 20:
        reasons.append("Unusual login time")

    if session["files_accessed"] > 50:
        reasons.append("High file access volume")

    if session["download_size"] > 200:
        reasons.append("Large data download")

    if session["location_code"] != 1:
        reasons.append("Login from unusual location")

    if session["device_code"] != 1:
        reasons.append("Unrecognized device used")

    if session["department_code"] not in [1, 2, 3]:
        reasons.append("Accessed unusual department resources")

    return reasons


def classify_threat(risk, reasons):
    if risk >= 80:
        if "Large data download" in reasons:
            return "Credential Theft / Data Exfiltration"
        return "Critical Insider Threat"
    elif risk >= 50:
        return "Suspicious Activity"
    else:
        return "Normal / Low Risk"


def generate_timeline(session):
    timeline = []

    timeline.append(f"{session['login_hour']}:00 - User login detected")

    if session["location_code"] != 1:
        timeline.append(f"{session['login_hour']}:02 - Unusual location detected")

    if session["device_code"] != 1:
        timeline.append(f"{session['login_hour']}:03 - New device detected")

    if session["files_accessed"] > 50:
        timeline.append(f"{session['login_hour']}:05 - High file access activity")

    if session["download_size"] > 200:
        timeline.append(f"{session['login_hour']}:08 - Bulk data download initiated")

    return timeline


def analyze_session(session):
    session_df = pd.DataFrame([session])

    prediction = model.predict(session_df[FEATURES])[0]
    anomaly_score = model.decision_function(session_df[FEATURES])[0]

    risk_score = calculate_risk(session)
    explanation = explain_session(session)
    threat_type = classify_threat(risk_score, explanation)
    timeline = generate_timeline(session)

    return {
        "prediction": "Anomaly" if prediction == -1 else "Normal",
        "anomaly_score": round(float(anomaly_score), 3),
        "risk_score": risk_score,
        "threat_type": threat_type,
        "explanation": explanation,
        "timeline": timeline,
        "confidence": round(min(abs(float(anomaly_score)) * 100 + risk_score / 2, 99), 2)
    }


if __name__ == "__main__":
    suspicious_session = {
        "login_hour": 2,
        "files_accessed": 87,
        "download_size": 900,
        "location_code": 2,
        "device_code": 2,
        "department_code": 4
    }

    result = analyze_session(suspicious_session)
    print(result)