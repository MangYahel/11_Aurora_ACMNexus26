# GhostTrace X

**Task-Bound Access Monitoring & Ticket Enforcement System**

![GhostTrace X](https://img.shields.io/badge/Status-Hackathon_Demo_Ready-success?style=for-the-badge&logo=shield) 
![React](https://img.shields.io/badge/Frontend-React_&_Tailwind-61DAFB?style=for-the-badge)
![Python](https://img.shields.io/badge/Backend-Python_Flask-3776AB?style=for-the-badge)

GhostTrace X is an enterprise security tool designed to solve the "Post-Login Misuse" problem. Traditional systems verify identity once at the door. GhostTrace X verifies that users are actually staying within the predefined boundaries of their active **Work Tickets** while they operate inside the network.

## 🎯 The Core Concept
- Administrators generate an explicit strict **Access Ticket** defining exactly what a user is allowed to do (e.g., "Rahul can read 10 files in /finance").
- The employee works on the system. GhostTrace X routes their live system telemetry into the Validation Engine.
- If the employee deviates (e.g., tries to 'export' files, or exceeds the data cap), the system instantly calculates the severity of the deviation.
- It automatically warns the user, alerts the Admin Global SOC queue, and if the deviation is severe enough—**it physically locks out the presentation laptop**.

---

## 🚀 How to Run Locally

### 1) Backend Setup (Flask Validation Engine API)
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Start the backend server:
   ```bash
   python app.py
   # OR on Windows: py app.py
   ```
   *The server acts as the API Gateway and the rules engine on `http://0.0.0.0:5000`*

### 2) Frontend Setup (React/Vite Application)
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev -- --host
   ```
   *Click the local output link (usually `http://localhost:5173`) to view the application in your browser.*

---

## 🛡️ Hackathon Pitch Walkthrough Guide
1. **The Admin Mode:** Open the React app and click the **Admin Governance** button on the top right.
2. **Explain the Ticket:** Show the judges how you generate a "Zero-Trust Task Ticket" defining strict Folder, Action, and Exfiltration limits. Look at the right side to show how the SOC Queue is completely clear.
3. **The Simulator:** Click the **Employee Workspace** button. Explain that Rahul has entered the network and bound his session to the "Finance" ticket. 
4. **The Safe Scenario:** In the Simulator, leave the metrics below his limits (e.g., 5 Files, 20 MB, Finance Dept, Read action) and hit **Run Compliance**. Show the judges the Green "Adherence" dashboard.
5. **The Bad Actor Scenario (The Wow Factor):** Now, simulate Rahul's password being compromised by an Insider Threat. Change the *Action Type* from "read" to "export". Change the *Mass File Sync* from 5 to 500. Hit **Run Compliance**. 
6. **The Action:** The screen will flash red, simulating terrifying administrative SOC lockdown protocols. **Wait 1.5 seconds**, and your physical laptop will run a true Windows OS lock, kicking you to the PIN screen to forcibly secure the hardware!
