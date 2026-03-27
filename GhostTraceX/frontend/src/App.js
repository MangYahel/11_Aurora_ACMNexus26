import React, { useState } from "react";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAI = async () => {
    console.log("Button clicked");
    setLoading(true);

    const sampleData = {
      login_hour: 2,
      files_accessed: 87,
      download_size: 900,
      location_code: 2,
      device_code: 2,
      department_code: 4,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sampleData),
      });

      const data = await response.json();
      console.log(data);
      setResult(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    }

    setLoading(false);
  };

  const getRiskColor = (score) => {
    if (score >= 80) return "text-red-400";
    if (score >= 50) return "text-yellow-400";
    return "text-green-400";
  };

  const getBadgeColor = (score) => {
    if (score >= 80) return "bg-red-500/20 text-red-300 border-red-500/40";
    if (score >= 50) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    return "bg-green-500/20 text-green-300 border-green-500/40";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-cyan-400 drop-shadow-lg">
            GhostTrace X
          </h1>
          <p className="text-slate-300 mt-3 text-lg">
            AI-Powered Behavioral Identity Threat Detection System
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">Users Monitored</p>
            <h2 className="text-3xl font-bold mt-2">128</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">Active Alerts</p>
            <h2 className="text-3xl font-bold mt-2 text-red-400">07</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">Avg Trust Score</p>
            <h2 className="text-3xl font-bold mt-2 text-green-400">82%</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <p className="text-slate-400 text-sm">Suspicious Sessions</p>
            <h2 className="text-3xl font-bold mt-2 text-yellow-400">14</h2>
          </div>
        </div>

        {/* Button */}
        <div className="mb-8">
          <button
            onClick={testAI}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-lg text-lg"
          >
            {loading ? "Analyzing..." : "⚡ Simulate Threat"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Threat Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">
                Threat Analysis Result
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-lg">
                    <span className="text-slate-400">Prediction:</span>{" "}
                    <span className="font-bold text-red-400">
                      {result.prediction}
                    </span>
                  </p>

                  <p className="text-lg">
                    <span className="text-slate-400">Threat Type:</span>{" "}
                    <span className="font-semibold">{result.threat_type}</span>
                  </p>

                  <p className="text-lg">
                    <span className="text-slate-400">Confidence:</span>{" "}
                    <span className="font-semibold">{result.confidence}%</span>
                  </p>
                </div>

                <div className="flex flex-col justify-center items-start">
                  <div
                    className={`px-4 py-2 rounded-full border text-sm font-semibold mb-4 ${getBadgeColor(
                      result.risk_score
                    )}`}
                  >
                    Risk Score: {result.risk_score}
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-5 rounded-full transition-all duration-700 ${
                        result.risk_score >= 80
                          ? "bg-red-500"
                          : result.risk_score >= 50
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${result.risk_score}%` }}
                    ></div>
                  </div>

                  <p className={`mt-3 text-xl font-bold ${getRiskColor(result.risk_score)}`}>
                    {result.risk_score >= 80
                      ? "Critical Threat"
                      : result.risk_score >= 50
                      ? "Moderate Threat"
                      : "Low Threat"}
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation + Timeline */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Explanation */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">
                  Why It Was Flagged
                </h3>
                <ul className="space-y-3">
                  {result.explanation.map((reason, index) => (
                    <li
                      key={index}
                      className="bg-slate-800 px-4 py-3 rounded-xl text-slate-200 border border-slate-700"
                    >
                      ⚠️ {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">
                  Attack Timeline
                </h3>
                <div className="space-y-4">
                  {result.timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-2 rounded-full bg-cyan-400 shadow-md"></div>
                      <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 w-full text-slate-200">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!result && (
          <div className="mt-16 text-center text-slate-500 text-lg">
            No active threat analysis yet. Click{" "}
            <span className="text-cyan-400 font-semibold">“Simulate Threat”</span>{" "}
            to test the AI engine.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;