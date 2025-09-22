// pages/CaregiverDashboard.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CaregiverDashboard() {
  const [patientMood, setPatientMood] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const patientId = localStorage.getItem("linkedPatient");

  useEffect(() => {
    const fetchMood = async () => {
      try {
        const res = await fetch(`${API}/api/caregivers/patient-mood`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) setPatientMood(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (patientId) fetchMood();
  }, [patientId]);

  const handleAskTips = async () => {
    if (!selectedTopic) return;
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          prompt: `Give caregiver tips for helping a patient with: ${selectedTopic}`,
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || data.message || data.output || "No advice available");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <h2>Caregiver Dashboard</h2>

      <section className="mb-4">
        <h4>Patient’s Mood</h4>
        {patientMood ? (
          <pre>{JSON.stringify(patientMood, null, 2)}</pre>
        ) : (
          <p>No mood data yet.</p>
        )}
      </section>

      <section>
        <h4>Caregiver Tips</h4>
        <select
          className="form-select mb-3"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Pick a struggle</option>
          <option value="hair loss">Hair loss</option>
          <option value="yoga exercises">Yoga exercises</option>
          <option value="PET scan">PET scan</option>
          <option value="chemo boredom">Chemo session boredom</option>
          <option value="nutrition">Nutrition</option>
          <option value="emotional support">Emotional support</option>
        </select>
        <button className="btn btn-primary" onClick={handleAskTips}>
          Get AI Advice
        </button>
        {aiResponse && (
          <div className="alert alert-info mt-3">
            <strong>AI:</strong> {aiResponse}
          </div>
        )}
      </section>
    </div>
  );
}
