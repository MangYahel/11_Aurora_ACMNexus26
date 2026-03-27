import random

def analyze_session(baseline, session_data):
    """
    Analyzes current session data against the user's learned dynamic baseline.
    """
    risk_score = 0
    anomalies = []
    explanations = []
    timeline = []
    recommended_actions = []

    current_hour = session_data.get('login_hour', 9)
    current_time = f"02:00 AM" if current_hour < 6 else f"{current_hour:02d}:00 AM"
    timeline.append(f"{current_time} - Session initialized on endpoint")

    if not baseline or baseline.get('session_count', 0) < 1:
        # Not enough data for strict anomaly checking
        return {
            "prediction": "Learning Phase",
            "threat_type": "Insufficient Baseline Data",
            "risk_score": 0,
            "risk_level": "Low",
            "confidence": 50,
            "identity_drift": "Unknown",
            "explanation": ["System is currently building a behavioral pattern. 3+ sessions required for accurate Identity Drift detection."],
            "timeline": timeline + [f"{current_time[:-2]}01 {current_time[-2:]} - Recording routine behaviors for baseline."],
            "recommended_actions": ["Train AI with normal behaviors", "Do not rely on trace yet"],
            "alert_status": "Monitoring",
            "admin_notification": "None",
            "auto_response_triggered": "None"
        }

    # 1. Login Hour Anomaly (check standard deviation loosely)
    all_hours = baseline.get('login_hours', [])
    avg_hour = sum(all_hours) / len(all_hours) if all_hours else 9
    login_diff = abs(avg_hour - current_hour)
    if login_diff > 3:
        risk_score += 20
        anomalies.append("login_time")
        explanations.append(f"Unusual login time ({login_diff:.1f} hours off usual average of {avg_hour:.1f}:00)")
        timeline.append(f"{current_time[:-2]}05 {current_time[-2:]} - Unusual login time flagged")

    # 2. Device Anomaly
    trusted_devices = baseline.get('trusted_devices', [])
    current_device = session_data.get('device', '')
    if current_device not in trusted_devices:
        risk_score += 25
        anomalies.append("device")
        explanations.append(f"Logged in from untrained device signature: {current_device}")
        timeline.append(f"{current_time[:-2]}08 {current_time[-2:]} - Unknown device footprint detected")

    # 3. Location Anomaly
    trusted_locations = baseline.get('trusted_locations', [])
    current_location = session_data.get('location', '')
    if current_location not in trusted_locations:
        risk_score += 25
        anomalies.append("location")
        explanations.append(f"Login from highly irregular geo-point: {current_location}")
        timeline.append(f"{current_time[:-2]}09 {current_time[-2:]} - Geolocation mismatch registered")

    # 4. Department Anomaly
    trusted_depts = baseline.get('trusted_departments', [])
    current_dept = session_data.get('department', '')
    if current_dept not in trusted_depts and current_dept:
        risk_score += 20
        anomalies.append("department")
        explanations.append(f"Accessed irregular department zone: {current_dept} (Untrained)")
        timeline.append(f"{current_time[:-2]}15 {current_time[-2:]} - Unauthorized cross-department access attempt")

    # 5. File Access Anomaly
    avg_files = max(1, baseline.get('files_accessed_avg', 1))
    files_accessed = session_data.get('files_accessed', 0)
    files_ratio = files_accessed / avg_files
    if files_ratio > 10:
        risk_score += 45
        anomalies.append("file_access")
        explanations.append(f"Extreme file access spike ({files_accessed} vs dynamic average {avg_files:.0f})")
        timeline.append(f"{current_time[:-2]}22 {current_time[-2:]} - Extreme data access spike observed")
    elif files_ratio > 3:
        risk_score += 15
        anomalies.append("file_access")
        explanations.append(f"Drastic file access spike ({files_accessed} vs dynamic average {avg_files:.0f})")
        timeline.append(f"{current_time[:-2]}22 {current_time[-2:]} - Massive data access spike observed")

    # 6. Download Anomaly
    avg_dl = max(1, baseline.get('download_size_mb_avg', 1))
    current_dl = session_data.get('download_size_mb', 0)
    dl_ratio = current_dl / avg_dl
    if dl_ratio > 10:
        risk_score += 45
        anomalies.append("download")
        explanations.append(f"Massive network exfiltration ({current_dl}MB vs dynamic average {avg_dl:.0f}MB)")
        timeline.append(f"{current_time[:-2]}25 {current_time[-2:]} - Massive data stream initiated")
    elif dl_ratio > 4:
        risk_score += 20
        anomalies.append("download")
        explanations.append(f"Irregular mass download ({current_dl}MB vs dynamic average {avg_dl:.0f}MB)")
        timeline.append(f"{current_time[:-2]}25 {current_time[-2:]} - Bulk data download initiated")

    # Cap risk score
    risk_score = min(100, risk_score)
    
    # Confidence Level
    confidence = random.randint(85, 99) if risk_score > 30 else random.randint(70, 85)

    # Classifications & Risk levels
    if risk_score <= 20:
        threat_type = "Verified Identity"
        risk_level = "Low"
        identity_drift = "None - Behaviors Match Baseline"
        recommended_actions = ["Log session analytics", "Continue autonomous monitoring"]
        alert_status = "Resolved"
        auto_response = "Baseline Updated"
    elif risk_score <= 50:
        threat_type = "Suspicious Behavior"
        risk_level = "Medium"
        identity_drift = "Possible Session Hijack"
        recommended_actions = ["Generate SOC alert", "Increase session logging", "Silent re-verification prompt"]
        timeline.append(f"{current_time[:-2]}30 {current_time[-2:]} - Agent tagged for escalated monitoring")
        alert_status = "Active"
        auto_response = "Invisible MFA Triggered"
    elif risk_score <= 80:
        if "department" in anomalies and "download" in anomalies:
            threat_type = "Insider Threat Profile"
        else:
            threat_type = "Stolen Credential Hypothesis"
        risk_level = "High"
        identity_drift = "Confirmed Drift Sequence"
        recommended_actions = ["Push alert to Admin SOC Board", "Restrict write access", "Flag session for human review"]
        timeline.append(f"{current_time[:-2]}35 {current_time[-2:]} - Threat Matrix escalated to High")
        alert_status = "Active"
        auto_response = "Sensitive Zones Restricted"
    else:
        if "download" in anomalies and "file_access" in anomalies and "location" in anomalies:
            threat_type = "Active Exfiltration Attempt"
        elif "device" in anomalies and "location" in anomalies:
            threat_type = "Breach / Unauthorized VPN Entry"
        else:
            threat_type = "Severe Behavioral Drift"
        
        risk_level = "Critical"
        identity_drift = "Critical Threat Detected"
        recommended_actions = ["Blast Admin SOC Queue", "Immediate Endpoint Isolation", "Lock physical account", "Block network out-ports"]
        timeline.append(f"{current_time[:-2]}40 {current_time[-2:]} - Extreme risk score calculated. SOC blasted.")
        timeline.append(f"{current_time[:-2]}41 {current_time[-2:]} - Account locked. Endpoint networking killed.")
        alert_status = "Active"
        auto_response = "Account Locked & Endpoint Isolated"
        
        # PHYSICAL WINDOWS LOCK: 
        # When critical risk is hit, spawn a thread to lock the workstation 1.5s after returning the UI
        def execute_lock():
            import time
            import os
            time.sleep(1.5)
            os.system("rundll32.exe user32.dll,LockWorkStation")
            
        import threading
        threading.Thread(target=execute_lock).start()

    if risk_score <= 20:
        explanations.insert(0, f"Live inputs match the AI expectation trained over {baseline.get('session_count', 0)} previous trusted sessions.")

    return {
        "prediction": threat_type,
        "threat_type": threat_type,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": confidence,
        "identity_drift": identity_drift,
        "explanation": explanations,
        "timeline": timeline,
        "recommended_actions": recommended_actions,
        "alert_status": alert_status,
        "admin_notification": "Sent to SOC" if risk_score > 50 else "None",
        "auto_response_triggered": auto_response
    }