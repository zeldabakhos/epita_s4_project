import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function MoodCheck() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [anecdote, setAnecdote] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/mood/questions`)
      .then((res) => res.json())
      .then(setQuestions)
      .catch(() => setError("Failed to load questions"));
  }, []);

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return setError("Please log in first");

      const payload = {
        userId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value: Number(value),
        })),
        anecdote,
      };

      const res = await fetch(`${API}/api/mood/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ maxWidth: 720, margin: "auto" }}>
      <h2 className="mb-3">Mood Tracker</h2>
      <p className="text-muted">Answer the questions below to unlock the chatbot.</p>

      {questions.map((q) => (
        <div key={q._id} className="card mb-3 p-3">
          <strong>{q.text}</strong>
          <div className="mt-2">
            {q.options.map((opt) => (
              <label key={opt.value} className="me-3">
                <input
                  type="radio"
                  name={q._id}
                  value={opt.value}
                  checked={String(answers[q._id]) === String(opt.value)}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))}
                />
                {" "}{opt.label}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-3">
        <label htmlFor="anecdote" className="form-label">Optional Anecdote</label>
        <textarea
          id="anecdote"
          className="form-control"
          rows="4"
          value={anecdote}
          onChange={(e) => setAnecdote(e.target.value)}
          placeholder="Share anything else you want..."
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>

      {result && (
        <div className="alert alert-info mt-3">
          <p><strong>Score:</strong> {result.score}</p>
          <p><strong>Severity:</strong> {result.severity}</p>
          <button className="btn btn-success" onClick={() => (window.location.href = "/chat")}>
            Open Chatbot
          </button>
        </div>
      )}
    </div>
  );
}
