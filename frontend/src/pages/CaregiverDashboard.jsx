// pages/CaregiverDashboard.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CaregiverDashboard() {
  const [patientId, setPatientId] = useState(localStorage.getItem("linkedPatient") || "");
  const [patientMood, setPatientMood] = useState(null);
  const [loadingMood, setLoadingMood] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState("");

  // 1) Fetch /me to discover linked patient
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const me = await res.json();
        if (!res.ok) {
          setError(me.message || "Failed to load profile");
          return;
        }
        if (me.role !== "caregiver") {
          setError("This page is for caregivers only.");
          return;
        }
        if (me.linkedPatient) {
          setPatientId(me.linkedPatient);
          localStorage.setItem("linkedPatient", me.linkedPatient);
          setError(""); // clear any previous “no patient” message
        } else {
          setPatientId("");
          setError("No patient linked yet. Ask the patient to invite this email.");
        }
      } catch (e) {
        console.error(e);
        setError("Could not load your profile.");
      }
    };
    fetchMe();
  }, []);

  // 2) Fetch latest mood when we know patientId
  useEffect(() => {
    const fetchMood = async () => {
      if (!patientId) {
        setPatientMood(null);
        return;
      }
      setLoadingMood(true);
      try {
        const res = await fetch(
          `${API}/api/mood/entries/latest?userId=${patientId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setPatientMood(data);
          // Don’t keep a stale “No mood data yet.” error if we now have data
          setError("");
        } else {
          setPatientMood(null);
          setError(data.message || data.error || "No mood data yet.");
        }
      } catch (e) {
        console.error(e);
        setPatientMood(null);
        setError("Failed to fetch patient mood.");
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMood();
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
      setAiResponse("Could not get advice.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Caregiver Dashboard</h2>

      {/* Top notice if no link yet */}
      {!patientId && (
        <div className="alert alert-warning">
          No patient linked yet. Ask the patient to invite this email.
        </div>
      )}
      {/* Other errors (auth / fetch etc.) */}
      {patientId && error && (
        <div className="alert alert-light border">{error}</div>
      )}

      <section className="mb-4">
        <h4 className="mb-3">Patient’s Mood</h4>
        {loadingMood ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status" /> Loading…
          </div>
        ) : patientMood ? (
          <MoodCard entry={patientMood} />
        ) : (
          <p className="text-muted">{patientId ? "No mood data yet." : "Linking patient…"}</p>
        )}
      </section>

      <section>
        <h4 className="mb-3">Caregiver Tips</h4>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{ maxWidth: 420 }}
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
        </div>
        {aiResponse && (
          <div className="alert alert-info mt-3">
            <strong>AI:</strong> {aiResponse}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- Pretty mood card ---------- */
function MoodCard({ entry }) {
  if (!entry) return null;

  const pretty = {
    overallMood: "Overall mood",
    anxiety: "Anxiety",
    sleep: "Sleep",
    energy: "Energy",
    pain: "Pain",
    appetite: "Appetite",
  };

  const color = (v) => {
    const t = String(v).toLowerCase();
    if (["very low", "poor", "severe", "exhausted"].some(x => t.includes(x))) return "danger";
    if (["low", "mild", "fair"].some(x => t.includes(x))) return "warning";
    if (["ok", "okay", "normal"].some(x => t.includes(x))) return "secondary";
    if (["great", "good", "excellent", "energized", "strong", "none"].some(x => t.includes(x))) return "success";
    return "secondary";
  };

  const fmt = (d) =>
    new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const pairs = Object.fromEntries(entry.answers.map(a => [a.questionId, a.value]));
  const tiles = ["overallMood", "anxiety", "sleep", "energy", "pain", "appetite"];

  return (
    <div className="mood-card">
      <div className="mood-card__header">
        <div>
          <div className="mood-card__title">Patient’s mood</div>
          <div className="mood-card__meta">
            Latest check-in • {fmt(entry.createdAt || entry.updatedAt || Date.now())}
          </div>
        </div>
        <span className={`badge bg-${color(pairs.overallMood)} rounded-pill px-3 py-2`}>
          {pairs.overallMood || "—"}
        </span>
      </div>

      <div className="mood-grid">
        {tiles.map((k) => (
          <div key={k} className="mood-tile">
            <div className="mood-tile__label">{pretty[k]}</div>
            <div className={`badge bg-${color(pairs[k])} mood-tile__chip`}>
              {pairs[k] || "—"}
            </div>
          </div>
        ))}
      </div>

      {typeof entry.score === "number" && entry.severity && (
        <div className="mood-footer">
          <div className="mood-footer__item">
            <span className="mood-footer__label">Overall score</span>
            <span className="mood-footer__value">{entry.score}</span>
          </div>
          <div className="mood-footer__item">
            <span className="mood-footer__label">Severity</span>
            <span className={`badge bg-${color(entry.severity)} px-3`}>{entry.severity}</span>
          </div>
        </div>
      )}
    </div>
  );
}
