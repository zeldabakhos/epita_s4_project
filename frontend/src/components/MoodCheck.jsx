import { useState } from "react";
import ChatWidget from "../components/ChatWidget.jsx";

export default function MoodCheck() {
  const [answers, setAnswers] = useState({});   // holds your form answers
  const [submitted, setSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setChatOpen(true); // open Ally right after check-in
    // ... (save answers if you also post them to backend)
  };

  return (
    <div className="container py-3">
      {/* your existing mood form — make sure each field updates setAnswers({...}) */}
      <form onSubmit={onSubmit}>{/* inputs calling setAnswers */}</form>

      {submitted && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mt-3">
          <div>
            <div className="fw-semibold">Want to chat?</div>
            <small>Open Ally to reflect on your check-in and plan a tiny next step.</small>
          </div>
          <button className="btn btn-danger" onClick={() => setChatOpen(true)}>Talk to Ally</button>
        </div>
      )}

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} moodContext={answers} />
    </div>
  );
}
