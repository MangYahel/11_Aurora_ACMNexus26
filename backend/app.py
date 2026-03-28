from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import requests
import random
import datetime
from ticket_validator import validate_ticket

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

# Global in-memory queue for SOC incidents
soc_alerts = []

# Admin control state
ADMIN_BYPASS_PIN = "1234"

# Per-user endpoint state
endpoint_states = {
    "Irene": {"mode": "normal"},
    "Alice": {"mode": "normal"}
}


def load_tickets():
    filepath = os.path.join('data', 'tickets.json')
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_tickets(tickets):
    filepath = os.path.join('data', 'tickets.json')
    os.makedirs('data', exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(tickets, f, indent=4)


def get_next_ticket_id(tickets):
    if not tickets:
        return "GTX-101"
    existing = []
    for t in tickets:
        tid = str(t.get("id", ""))
        if tid.startswith("GTX-"):
            try:
                existing.append(int(tid.replace("GTX-", "")))
            except:
                pass
    next_num = max(existing) + 1 if existing else 101
    return f"GTX-{next_num}"


@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    tickets = load_tickets()
    return jsonify({"success": True, "tickets": tickets})


@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    data = request.json or {}
    tickets = load_tickets()

    new_ticket = {
        "id": get_next_ticket_id(tickets),
        "user_name": data.get("user_name", "Irene"),
        "department": data.get("department", ""),
        "task_description": data.get("task_description", ""),
        "allowed_folders": data.get("allowed_folders", ""),
        "allowed_actions": data.get("allowed_actions", ""),
        "allowed_apps": data.get("allowed_apps", "chrome, excel, vscode"),
        "allowed_websites": data.get("allowed_websites", "docs.google.com"),
        "max_files": data.get("max_files", 0),
        "max_download_mb": data.get("max_download_mb", 0),
        "time_window": data.get("time_window", ""),
        "status": "ACTIVE"
    }

    tickets.append(new_ticket)
    save_tickets(tickets)
    return jsonify({"success": True, "ticket": new_ticket})


@app.route('/api/tickets/<ticket_id>', methods=['DELETE'])
def delete_ticket(ticket_id):
    tickets = load_tickets()
    updated_tickets = [t for t in tickets if t.get("id") != ticket_id]
    save_tickets(updated_tickets)
    return jsonify({"success": True, "message": f"{ticket_id} deleted"})


@app.route('/api/analyze_session', methods=['POST'])
def handle_analyze_session():
    data = request.json or {}
    tickets = load_tickets()

    ticket_id = data.get("ticket_id")
    target_ticket = next((t for t in tickets if t.get('id') == ticket_id), None)

    if not target_ticket:
        return jsonify({"success": False, "error": "Approved Ticket not found"}), 404

    result = validate_ticket(target_ticket, data)
    user = target_ticket.get("user_name", "Irene")

    # Log all non-normal deviations to SOC
    if result.get("violation_detected"):
        alert = {
            "incident_id": f"INC-{datetime.datetime.now().strftime('%M%S')}-{random.randint(10,99)}",
            "ticket_id": target_ticket.get("id"),
            "user": user,
            "violation_type": result.get("violation_type"),
            "severity": result.get("severity"),
            "timestamp": result.get("timestamp"),
            "status": "OPEN",
            "action_taken": result.get("admin_notification")
        }
        soc_alerts.insert(0, alert)

        # ONLY CRITICAL causes endpoint lock
        if result.get("severity") == "CRITICAL":
            endpoint_states[user] = {"mode": "locked"}

    else:
        # SAFE SESSION AUTO-HEAL
        current_mode = endpoint_states.get(user, {}).get("mode", "normal")
        if current_mode == "locked":
            endpoint_states[user] = {"mode": "normal"}

    return jsonify({"success": True, "data": result})


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify({"success": True, "alerts": soc_alerts})


# =========================
# ADMIN CONTROL ROUTES
# =========================

@app.route('/api/admin/verify-pin', methods=['POST'])
def verify_admin_pin():
    data = request.json or {}
    pin = data.get("pin")

    if pin == ADMIN_BYPASS_PIN:
        return jsonify({"success": True, "message": "PIN verified"})
    return jsonify({"success": False, "message": "Invalid PIN"}), 401


@app.route('/api/admin/unlock', methods=['POST'])
def admin_unlock():
    data = request.json or {}
    user = data.get("user", "Irene")
    endpoint_states[user] = {"mode": "normal"}
    return jsonify({"success": True, "message": f"{user} endpoint unlocked"})


@app.route('/api/admin/sleep', methods=['POST'])
def admin_sleep():
    data = request.json or {}
    user = data.get("user", "Irene")

    endpoint_states[user] = {"mode": "sleep"}

    if user == "Irene":
        try:
            requests.post(
                "http://10.38.189.113:5050/agent/sleep",
                json={"secret": "ghosttrace-secure"},
                timeout=3
            )
        except Exception as e:
            print("Sleep failed:", e)

    return jsonify({"success": True, "message": f"{user} endpoint put to sleep"})


@app.route('/api/admin/shutdown', methods=['POST'])
def admin_shutdown():
    data = request.json or {}
    user = data.get("user", "Irene")

    endpoint_states[user] = {"mode": "shutdown"}

    if user == "Irene":
        try:
            requests.post(
                "http://10.38.189.113:5050/agent/shutdown",
                json={"secret": "ghosttrace-secure"},
                timeout=3
            )
        except Exception as e:
            print("Shutdown failed:", e)

    return jsonify({"success": True, "message": f"{user} endpoint shutdown triggered"})



# =========================
# FRONTEND SERVING
# =========================

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static_files(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
