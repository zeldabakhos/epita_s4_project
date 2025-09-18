import { useState, useEffect } from "react";

/* -------- Tiny modal component (inline) -------- */
function MessageModal({ open, onClose, message }) {
  // close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click outside to close
      }}
    >
      <div className="modal-window">
        <p>{message}</p>
        <button className="btn btn-primary" onClick={onClose}>OK ✨</button>
      </div>
    </div>
  );
}

const QUESTIONS = [
  { key: "overallMood", title: "Overall mood today", options: ["Very low", "Low", "OK", "Great"] },
  { key: "anxiety",     title: "Anxiety level",      options: ["None", "Mild", "Moderate", "Severe"] },
  { key: "sleep",       title: "Sleep quality",      options: ["Poor", "Fair", "Good", "Excellent"] },
  { key: "energy",      title: "Energy level",       options: ["Exhausted", "Low", "Okay", "Energized"] },
  { key: "pain",        title: "Pain level",         options: ["None", "Mild", "Moderate", "Severe"] },
  { key: "appetite",    title: "Appetite today",     options: ["Very poor", "Low", "Normal", "Strong"] },
];

export default function MoodCheck() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const allAnswered = QUESTIONS.every((q) => !!answers[q.key]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!allAnswered) return;

    // TODO: replace with your real submit/unlock logic (API + navigate)
    setModalOpen(true); // show pastel modal instead of alert
  };

  return (
    <div>
      <header style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0, letterSpacing: "-0.02em" }}>
          MOOD TRACKER <span style={{ fontSize: 14, color: "#475569" }}>— let’s check in 💬</span>
        </h1>
        <p style={{ color: "#475569", marginTop: 6 }}>
          Answer a few quick questions to unlock the chatbot buddy.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gap: 16 }}>
          {QUESTIONS.map((q) => (
            <QuestionCard
              key={q.key}
              title={q.title}
              required
              name={q.key}
              options={q.options}
              value={answers[q.key] || ""}
              onChange={(v) => handleChange(q.key, v)}
              showError={submitted && !answers[q.key]}
            />
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn-primary">Continue ✨</button>
          {!allAnswered && submitted && (
            <span style={{ color: "#b91c1c", alignSelf: "center", fontSize: 14 }}>
              Please answer all required questions.
            </span>
          )}
        </div>
      </form>

      {/* Pastel message modal */}
      <MessageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message="Thanks! The chatbot is now unlocked ✨"
      />
    </div>
  );
}

function QuestionCard({ title, required, name, options, value, onChange, showError }) {
  return (
    <section className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        {required && <span className="badge">required 🙂</span>}
      </div>

      <div className="options">
        {options.map((label) => {
          const id = `${name}-${label.replace(/\s+/g, "").toLowerCase()}`;
          return (
            <label key={id} htmlFor={id} className="pill">
              <input
                id={id}
                type="radio"
                name={name}
                value={label}
                checked={value === label}
                onChange={(e) => onChange(e.target.value)}
              />
              {label}
            </label>
          );
        })}
      </div>

      {showError && (
        <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 13 }}>
          Please choose an option.
        </div>
      )}
    </section>
  );
}
