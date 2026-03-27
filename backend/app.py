from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import datetime
from ai_model import analyze_session

app = Flask(__name__)
CORS(app)  # Enable CORS for the React frontend

# Global in-memory queue for SOC alerts
soc_alerts = []

def load_users_data():
    filepath = os.path.join('data', 'users.json')
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_users_data(users):
    filepath = os.path.join('data', 'users.json')
    os.makedirs('data', exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(users, f, indent=4)

@app.route('/api/users', methods=['GET'])
def get_users():
    users = load_users_data()
    return jsonify({"success": True, "users": users})

@app.route('/api/train', methods=['POST'])
def train_baseline():
    """
    Submits a 'normal' behavior sequence to train the AI logic.
    Updates moving averages and trusted device/location arrays.
    """
    data = request.json
    if not data or 'user_id' not in data:
        return jsonify({"success": False, "error": "Missing user_id"}), 400

    users = load_users_data()
    for u in users:
        if u['id'] == data['user_id']:
            baseline = u.get('baseline', {})
            if not baseline:
                 baseline = {"session_count": 0, "login_hours": [], "trusted_locations": [], "trusted_devices": [], "trusted_departments": [], "files_accessed_avg": 0, "download_size_mb_avg": 0}
            
            # Update counts
            sc = baseline.get("session_count", 0)
            
            # Update arrays
            if data.get('login_hour') is not None: baseline['login_hours'] = baseline.get('login_hours', []) + [int(data['login_hour'])]
            if data.get('location') and data['location'] not in baseline.get('trusted_locations', []): baseline.setdefault('trusted_locations', []).append(data['location'])
            if data.get('device') and data['device'] not in baseline.get('trusted_devices', []): baseline.setdefault('trusted_devices', []).append(data['device'])
            if data.get('department') and data['department'] not in baseline.get('trusted_departments', []): baseline.setdefault('trusted_departments', []).append(data['department'])
            
            # Update moving averages
            f_avg = baseline.get('files_accessed_avg', 0)
            d_avg = baseline.get('download_size_mb_avg', 0)
            baseline['files_accessed_avg'] = ((f_avg * sc) + float(data.get('files_accessed', 0))) / (sc + 1)
            baseline['download_size_mb_avg'] = ((d_avg * sc) + float(data.get('download_size_mb', 0))) / (sc + 1)
            
            baseline['session_count'] = sc + 1
            u['baseline'] = baseline
            break
            
    save_users_data(users)
    return jsonify({"success": True, "message": "Baseline dynamically updated"})

@app.route('/api/analyze_session', methods=['POST'])
def handle_analyze_session():
    """
    Runs live tracing heuristics against baseline.
    If high risk, pumps an alert to the SOC Admin Queue.
    """
    data = request.json
    users = load_users_data()
    selected_user = next((u for u in users if u['id'] == data.get('user_id')), None)
    
    if not selected_user:
        return jsonify({"success": False, "error": "User not found"}), 404

    baseline = selected_user.get('baseline', {})
    result = analyze_session(baseline, data)
    
    result["user_id"] = data['user_id']
    result["user_name"] = selected_user.get('name')
    
    # If the system identifies Identity Drift, send alert to Admin Array
    if result.get("risk_score", 0) > 40:
        alert = {
            "id": len(soc_alerts) + 1,
            "timestamp": datetime.datetime.now().strftime("%I:%M %p"),
            "machine": selected_user.get('id'),
            "user": selected_user.get('name'),
            "threat_type": result.get("threat_type"),
            "risk_level": result.get("risk_level"),
            "location": data.get("location", "Unknown"),
            "auto_response": result.get("auto_response_triggered", "None")
        }
        # Insert at top of queue
        soc_alerts.insert(0, alert)
    
    return jsonify({"success": True, "data": result})

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Returns global active SOC alerts for the Admin Laptop"""
    return jsonify({"success": True, "alerts": soc_alerts})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)