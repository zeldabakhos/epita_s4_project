// src/pages/ChatPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget.jsx";

export default function ChatPage() {
  const navigate = useNavigate();
  const [moodContext, setMoodContext] = useState(null);
  const [showAdvisory, setShowAdvisory] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastMoodCheck");
      const parsed = raw ? JSON.parse(raw) : null;
      setMoodContext(parsed);
      setShowAdvisory(!parsed); // advise if no check-in yet
    } catch {
      setMoodContext(null);
      setShowAdvisory(true);
    }
  }, []);

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Ally — Chat</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {showAdvisory && (
        <div className="alert alert-info d-flex flex-wrap align-items-center justify-content-between">
          <div className="me-2">
            For better support, it’s recommended to complete a quick Mood Check first. Would you like to go there now?
          </div>
          <div className="d-flex gap-2 mt-2 mt-sm-0">
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/mood-check")}>
              Yes, take me there
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowAdvisory(false)}>
              No, continue to chat
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen-ish chat experience */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <ChatWidget open={true} onClose={() => {}} moodContext={moodContext || {}} />
        </div>
      </div>
    </div>
  );
}
