# GhostTrace X

**Continuous Behavioral Identity Threat Detection System**

![GhostTrace X](https://img.shields.io/badge/Status-Hackathon_Demo_Ready-success?style=for-the-badge&logo=shield) 
![React](https://img.shields.io/badge/Frontend-React_&_Tailwind-61DAFB?style=for-the-badge)
![Python](https://img.shields.io/badge/Backend-Python_Flask-3776AB?style=for-the-badge)

GhostTrace X is a continuous behavioral verification tool that dynamically learns legitimate user behaviors in real-time, and constantly monitors live session activities to catch Identity Drift.

## 💻 The 3-Laptop Architecture (Demo Structure)
To perfectly simulate an enterprise environment during your pitch, GhostTrace X is structured around three distinct endpoint modes selected from the main dashboard:
1. **Admin SOC Laptop:** The global Security Operations Center. It doesn't track behavior; instead, it polls a live feed of anomalies generated securely by the network's endpoints.
2. **Employee Laptop 1 (Rahul):** An endpoint simulation running our AI agent.
3. **Employee Laptop 2 (Aisha):** An endpoint simulation running our AI agent.

### The Real-Time Learning Pipeline:
Instead of relying on hardcoded rules, Employee laptops start with almost **zero training**.
- Clicking **Submit Routine Work (Train AI)** passes normal behaviors (e.g., logging in at 9 AM, accessing Finance) into the database. The AI recalculates moving averages and updates its trusted arrays live.
- Clicking **Execute Live Threat Input** pushes an anomaly (e.g., logging in at 2 AM from an Unknown IP). The AI verifies it against the dynamically learned baseline, generates a threat alert, and pushes it to the Admin SOC feed.

---

## 🚀 How to Run Locally

### 1) Backend Setup (Flask Application)
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   # OR on Windows: py -m pip install -r requirements.txt
   ```
3. Start the backend server:
   ```bash
   python app.py
   # OR on Windows: py app.py
   ```
   *The server will start on `http://127.0.0.1:5000`*

### 2) Frontend Setup (React/Vite Application)
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Click the local output link (usually `http://localhost:5173`) to view the application in your browser.*

---

## 🛡️ Hackathon Pitch Walkthrough Guide
1. **Start on Employee 1:** Select "Rahul - Employee Role". Note that the AI says `Insufficient Data`.
2. **Train the AI Live:** Hit "Submit Routine Work" 3-4 times. Watch the *AI Confidence Level* tick up as it learns his trusted location (Mumbai Office) and standard file downloads.
3. **Inject the Attack:** Change the Login Hour to "3" and Location to "Russia VPN". Hit **Execute Live Threat**. Watch the Critical Matrix trigger.
4. **The Big Reveal:** Switch the top dropdown to **Admin SOC Role**. The judges will see the dashboard swap entirely to a Global SOC view, where a Critical Identity Drift Alert has just flashed onto the screen citing Employee 1's exact host machine!
