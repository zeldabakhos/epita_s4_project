import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ---- Static MCQs shown in the UI (always the same) ----
// keys 'mood', 'anxiety', 'sleep' map to backend seed questions.
// The other three (energy, pain, appetite) are UI-only for now.
const QUESTIONS = [
  {
    key: "mood",
    text: "Overall mood today",
    required: true,
    options: [
      { label: "Very low", value: 0 },
      { label: "Low", value: 1 },
      { label: "OK", value: 2 },
      { label: "Great", value: 3 },
    ],
  },
  {
    key: "anxiety",
    text: "Anxiety level",
    required: true,
    options: [
      { label: "None", value: 0 },
      { label: "Mild", value: 1 },
      { label: "Moderate", value: 2 },
      { label: "Severe", value: 3 },
    ],
  },
  {
    key: "sleep",
    text: "Sleep quality",
    required: true,
    options: [
      { label: "Poor", value: 0 },
      { label: "Fair", value: 1 },
      { label: "Good", value: 2 },
      { label: "Excellent", value: 3 },
    ],
  },
  {
    key: "energy",
    text: "Energy level",
    required: true,
    options: [
      { label: "Exhausted", value: 0 },
      { label: "Low", value: 1 },
      { label: "Okay", value: 2 },
      { label: "Energized", value: 3 },
    ],
  },
  {
    key: "pain",
    text: "Pain level",
    required: true,
    options: [
      { label: "None", value: 0 },
      { label: "Mild", value: 1 },
      { label: "Moderate", value: 2 },
      { label: "Severe", value: 3 },
    ],
  },
  {
    key: "appetite",
    text: "Appetite today",
    required: false,
    options: [
      { label: "Very poor", value: 0 },
      { label: "Low", value: 1 },
      { label: "Normal", value: 2 },
      { label: "Strong", value: 3 },
    ],
  },
];

export default function MoodCheck() {
  const [answers, setAnswers] = useState({});
  const [anecdote, setAnecdote] = useState("");
  const [result, setResult] = useState(null);
  const [loadingIds, setLoadingIds] = useState(true);
  const [error, setError] = useState("");

  // map of backend keys -> questionId (ObjectId) so we can submit
  const [backendIds, setBackendIds] = useState({ mood: null, anxiety: null, sleep: null });

  // ensure backend has seed questions & fetch their IDs
  useEffect(() => {
    (async () => {
      try {
        setError("");
        // try to get questions
        let res = await fetch(`${API}/api/mood/questions`);
        let data = await res.json();

        // if empty, seed then refetch
        if (Array.isArray(data) && data.length === 0) {
          await fetch(`${API}/api/mood/seed`, { method: "POST" });
          res = await fetch(`${API}/api/mood/questions`);
          data = await res.json();
        }

        // build a map by 'key' (only first 3 exist in backend seed)
        const byKey = {};
        for (const q of data || []) {
          if (q.key) byKey[q.key] = q._id;
        }
        setBackendIds({
          mood: byKey.mood || null,
          anxiety: byKey.anxiety || null,
          sleep: byKey.sleep || null,
        });
      } catch (e) {
        setError("Could not contact the server for question IDs.");
      } finally {
        setLoadingIds(false);
      }
    })();
  }, []);

  const allRequiredAnswered = useMemo(() => {
    return QUESTIONS.filter(q => q.required).every(q => answers[q.key] !== undefined);
  }, [answers]);

  async function handleSubmit() {
    try {
      setError("");
      const userId = localStorage.getItem("userId");
      if (!userId) return setError("Please log in first.");

      // Build the payload for the backend using ONLY the 3 IDs it knows about
      const payloadAnswers = [];
      if (backendIds.mood != null && answers.mood !== undefined) {
        payloadAnswers.push({ questionId: backendIds.mood, value: Number(answers.mood) });
      }
      if (backendIds.anxiety != null && answers.anxiety !== undefined) {
        payloadAnswers.push({ questionId: backendIds.anxiety, value: Number(answers.anxiety) });
      }
      if (backendIds.sleep != null && answers.sleep !== undefined) {
        payloadAnswers.push({ questionId: backendIds.sleep, value: Number(answers.sleep) });
      }

      if (payloadAnswers.length < 3) {
        return setError("Server questions are not ready yet. Please try again.");
      }

      const res = await fetch(`${API}/api/mood/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers: payloadAnswers,
          anecdote, // harmless extra; backend ignores if not in schema
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Submit failed");
      setResult(data); // { id, score, severity, unlockChatbot }
    } catch (e) {
      setError(e.message);
    }
  }

  if (loadingIds) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <h1 className="mb-2">Mood Tracker</h1>
      <p className="text-muted mb-4">Answer the questions below to unlock the chatbot.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {QUESTIONS.map(q => (
        <div key={q.key} className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <strong>{q.text}</strong>
              {q.required && <span className="badge bg-primary">Required</span>}
            </div>
            <div className="mt-2">
              {q.options.map(opt => (
                <label key={opt.value} className="me-3">
                  <input
                    type="radio"
                    className="form-check-input me-1"
                    name={q.key}
                    value={opt.value}
                    checked={String(answers[q.key]) === String(opt.value)}
                    onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="mb-3">
        <label htmlFor="anec" className="form-label">Optional Anecdote</label>
        <textarea
          id="anec"
          className="form-control"
          placeholder="Share anything else you want..."
          rows={4}
          value={anecdote}
          onChange={e => setAnecdote(e.target.value)}
        />
      </div>

      <button
        className="btn btn-dark"
        onClick={handleSubmit}
        disabled={!allRequiredAnswered}
        title={!allRequiredAnswered ? "Please answer all required questions" : ""}
      >
        Submit
      </button>

      {result && (
        <div className="alert alert-info mt-3">
          <div><strong>Score:</strong> {result.score}</div>
          <div><strong>Severity:</strong> {result.severity}</div>
          <button
            className="btn btn-success mt-2"
            disabled={!result.unlockChatbot}
            onClick={() => (window.location.href = "/chat")}
          >
            Open Chatbot
          </button>
        </div>
      )}
    </div>
  );
}
