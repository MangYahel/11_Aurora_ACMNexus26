import datetime

def validate_ticket(ticket, session):
    risk_score = 0
    anomalies = []

    # -----------------------------------------------------
    # CLEAN / NORMALIZE EVERYTHING
    # -----------------------------------------------------
    def clean(val):
        return str(val).strip().lower()

    def clean_path(val):
        return str(val).strip().lower().rstrip("/")

    # -----------------------------------------------------
    # 1. DEPARTMENT BOUNDARY CHECK
    # -----------------------------------------------------
    ticket_department = clean(ticket.get("department", ""))
    session_department = clean(session.get("department", ""))

    if ticket_department and session_department and session_department != ticket_department:
        risk_score += 40
        anomalies.append(
            f"Department scope violation. Authorized area: '{ticket.get('department')}', Accessed: '{session.get('department')}'"
        )

    # -----------------------------------------------------
    # 2. FOLDER SCOPE CHECK (SAFE + NESTED SUPPORT)
    # -----------------------------------------------------
    allowed_folders = [
        clean_path(f)
        for f in ticket.get("allowed_folders", "").split(",")
        if clean_path(f)
    ]

    acc_folder = clean_path(session.get("accessed_folder", ""))

    if acc_folder and allowed_folders:
        folder_is_safe = any(
            acc_folder == af or acc_folder.startswith(af + "/")
            for af in allowed_folders
        )

        if not folder_is_safe:
            risk_score += 30
            anomalies.append(
                f"Unauthorized directory accessed: '{session.get('accessed_folder')}'"
            )

    # -----------------------------------------------------
    # 3. ACTION TYPE CHECK
    # -----------------------------------------------------
    allowed_actions = [
        clean(a)
        for a in ticket.get("allowed_actions", "").split(",")
        if clean(a)
    ]

    action_taken = clean(session.get("action_taken", ""))

    if action_taken and allowed_actions and action_taken not in allowed_actions:
        risk_score += 40
        anomalies.append(
            f"Unauthorized action escalated: attempted '{session.get('action_taken')}'"
        )

    # -----------------------------------------------------
    # 4. APPLICATION CHECK
    # -----------------------------------------------------
    allowed_apps = [
        clean(a)
        for a in ticket.get("allowed_apps", "chrome, excel").split(",")
        if clean(a)
    ]

    session_app = clean(session.get("active_app", ""))

    if session_app and allowed_apps and session_app not in allowed_apps:
        risk_score += 35
        anomalies.append(
            f"Unauthorized Software Execution: {session.get('active_app')}"
        )

    # -----------------------------------------------------
    # 5. WEBSITE CHECK
    # -----------------------------------------------------
    allowed_websites = [
        clean(w)
        for w in ticket.get("allowed_websites", "").split(",")
        if clean(w)
    ]

    session_web = clean(session.get("active_website", ""))

    if session_web and allowed_websites and session_web not in allowed_websites:
        risk_score += 20
        anomalies.append(
            f"Policy Violation: Non-compliant web traffic ({session.get('active_website')})"
        )

    # -----------------------------------------------------
    # 6. USB CHECK
    # -----------------------------------------------------
    usb_status = str(session.get("usb_inserted", "false")).strip().lower()

    if usb_status == "true":
        risk_score += 80
        anomalies.append(
            "CRITICAL: Unauthorized USB Mass Storage Device mounted!"
        )

    # -----------------------------------------------------
    # 7. FILE LIMIT CHECK (AI-LIKE ADAPTIVE RISK SCORING)
    # -----------------------------------------------------
    try:
        max_files = int(ticket.get("max_files", 0))
        files_accessed = int(session.get("files_accessed", 0))

        if max_files > 0 and files_accessed > max_files:
            ratio = files_accessed / max_files

            if ratio >= 10:
                risk_score += 90
                anomalies.append(
                    f"AI Risk Engine: Extreme file exfiltration pattern detected ({files_accessed} files vs limit {max_files})"
                )

            elif ratio >= 5:
                risk_score += 70
                anomalies.append(
                    f"AI Risk Engine: High-volume file misuse detected ({files_accessed} files vs limit {max_files})"
                )

            elif ratio >= 2:
                risk_score += 45
                anomalies.append(
                    f"AI Risk Engine: Moderate file access deviation detected ({files_accessed} files vs limit {max_files})"
                )

            else:
                risk_score += 20
                anomalies.append(
                    f"AI Risk Engine: Minor file boundary deviation ({files_accessed} files vs limit {max_files})"
                )
    except (ValueError, TypeError):
        pass

    # -----------------------------------------------------
    # 8. DOWNLOAD / EXFIL CHECK (AI-LIKE ADAPTIVE RISK SCORING)
    # -----------------------------------------------------
    try:
        max_mb = int(ticket.get("max_download_mb", 0))
        download_mb = int(session.get("download_size_mb", 0))

        if max_mb > 0 and download_mb > max_mb:
            ratio = download_mb / max_mb

            if ratio >= 10:
                risk_score += 90
                anomalies.append(
                    f"AI Risk Engine: Extreme data exfiltration signature detected ({download_mb}MB vs limit {max_mb}MB)"
                )

            elif ratio >= 5:
                risk_score += 70
                anomalies.append(
                    f"AI Risk Engine: High-volume download anomaly detected ({download_mb}MB vs limit {max_mb}MB)"
                )

            elif ratio >= 2:
                risk_score += 45
                anomalies.append(
                    f"AI Risk Engine: Moderate network payload deviation ({download_mb}MB vs limit {max_mb}MB)"
                )

            else:
                risk_score += 20
                anomalies.append(
                    f"AI Risk Engine: Minor download boundary deviation ({download_mb}MB vs limit {max_mb}MB)"
                )
    except (ValueError, TypeError):
        pass

    # -----------------------------------------------------
    # FINAL SCORE / STATUS
    # -----------------------------------------------------
    risk_score = min(100, risk_score)
    violation_detected = len(anomalies) > 0

    if risk_score == 0:
        severity = "NORMAL"
        compliance_status = "ADHERENCE"
        violation_type = "None"
        user_notification = "System Stable. Operating within assigned ticket parameters."
        admin_notification = "None"
        response_actions = ["Log active footprint"]

    elif risk_score <= 25:
        severity = "MINOR"
        compliance_status = "VIOLATION"
        violation_type = "Minor Boundary Deviation"
        user_notification = "Warning: Slight deviation from approved task boundaries detected."
        admin_notification = "Minor Deviation Logged - Warning Issued"
        response_actions = ["Warning Issued", "Alert Admin"]

    elif risk_score <= 50:
        severity = "MEDIUM"
        compliance_status = "VIOLATION"
        violation_type = "Medium Policy Deviation"
        user_notification = "Alert: Suspicious deviation detected. Activity has been flagged for review."
        admin_notification = "Medium Deviation - Risk Level Increased"
        response_actions = ["Stronger Alerts", "Increase Logging Tracking"]

    elif risk_score <= 80:
        severity = "HIGH"
        compliance_status = "VIOLATION"
        violation_type = "High Risk Behavioral Anomaly"
        user_notification = "High Risk Alert: Significant deviation detected. Session is under strict monitoring."
        admin_notification = "High Risk Incident - Escalation Recommended"
        response_actions = ["SOC Escalation", "Admin Review", "Prepare Endpoint Containment"]

    else:
        severity = "CRITICAL"
        compliance_status = "VIOLATION"
        violation_type = "Severe Task Misuse / Exfiltration Attempt"
        user_notification = "CRITICAL: Severe violation detected. Endpoint access terminated."
        admin_notification = "CRITICAL INCIDENT: Unauthorized Action - Target Locked"
        response_actions = ["Immediate Lockdown", "Admin Notification", "Disable Workflow"]

    return {
        "ticket_id": ticket.get("id"),
        "user_name": ticket.get("user_name"),
        "compliance_status": compliance_status,
        "violation_detected": violation_detected,
        "violation_type": violation_type,
        "severity": severity,
        "risk_score": risk_score,
        "explanation": anomalies,
        "user_notification": user_notification,
        "admin_notification": admin_notification,
        "response_actions": response_actions,
        "timestamp": datetime.datetime.now().strftime("%I:%M %p")
    }