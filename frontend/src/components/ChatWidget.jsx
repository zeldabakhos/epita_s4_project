// src/components/ChatWidget.jsx
import { useEffect, useRef, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ChatWidget({ open = true, onClose, moodContext }) {
  const [history, setHistory] = useState([]); // [{role, content}]
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, history]);

  if (!open) return null;

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setErr("");
    const nextHistory = [...history, { role: "user", content: message }];
    setHistory(nextHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          message,
          history: nextHistory,
          moodContext: moodContext || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setHistory((h) => [...h, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      setErr(e.message);
      setHistory((h) => [...h, { role: "assistant", content: "Hmm, I couldn’t reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "70vh" }}>
      <div
        ref={listRef}
        className="p-3"
        style={{ flex: 1, overflowY: "auto", background: "linear-gradient(180deg,#fff,#f8f9fa)" }}
      >
        {history.length === 0 && (
          <div className="alert alert-light border">
            <div className="fw-semibold mb-1">Hi! I’m Ally 🫶</div>
            <div>
              {moodContext && Object.keys(moodContext).length > 0 ? (
                <>
                  I see your check-in today:{" "}
                  <em>{Object.entries(moodContext).map(([k, v]) => `${k}: ${v}`).join("; ")}</em>. Want to talk about it
                  or plan one tiny action?
                </>
              ) : (
                <>How are you feeling right now? I can help you reflect, plan, or just vent.</>
              )}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`d-flex ${m.role === "user" ? "justify-content-end" : "justify-content-start"} mb-2`}>
            <div
              className={`px-3 py-2 rounded-3 ${m.role === "user" ? "text-white bg-primary" : "bg-white border"}`}
              style={{ maxWidth: "85%", whiteSpace: "pre-wrap" }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="d-flex justify-content-start">
            <div className="px-3 py-2 rounded-3 bg-white border">Ally is typing…</div>
          </div>
        )}

        {err && <div className="alert alert-danger mt-2 mb-0">{err}</div>}
      </div>

      <form
        className="p-2 border-top d-flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="form-control"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Send
        </button>
        {onClose && (
          <button className="btn btn-outline-secondary" type="button" onClick={onClose}>
            Close
          </button>
        )}
      </form>
    </div>
  );
}
