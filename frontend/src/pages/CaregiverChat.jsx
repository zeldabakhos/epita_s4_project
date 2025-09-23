import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CaregiverChat() {
  const [topic, setTopic] = useState("");
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // build an opening message from saved context
  const buildOpening = () => {
    const sys  = localStorage.getItem("caregiverSystem") || "";
    const top  = localStorage.getItem("caregiverTopic") || "";
    const raw  = localStorage.getItem("caregiverMoodPairs");
    const pairs = raw ? JSON.parse(raw) : {};

    const lines = [
      "You are an oncology caregiver coach talking to a family caregiver.",
      sys ? `SYSTEM: ${sys}` : "",
      top ? `Topic: ${top}` : "",
      `Patient context → overallMood: ${pairs.overallMood ?? "unknown"}, anxiety: ${pairs.anxiety ?? "unknown"}, sleep: ${pairs.sleep ?? "unknown"}, energy: ${pairs.energy ?? "unknown"}, pain: ${pairs.pain ?? "unknown"}, appetite: ${pairs.appetite ?? "unknown"}.`,
      "Give me 5–7 concrete ideas, 3 empathetic example phrases, 2 safety check reminders, and 2 quick self-care actions for me."
    ];
    return lines.filter(Boolean).join(" ");
  };

  // initial load: pull topic from localStorage and trigger first AI message
  useEffect(() => {
    const t = localStorage.getItem("caregiverTopic") || "caregiver self-care";
    setTopic(t);

    const prime = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: `caregiver_${t.replace(/\s+/g, "_")}`,
            message: buildOpening(), // initial prompt
          }),
        });
        const data = await res.json();
        setHistory([{ role: "assistant", content: data.reply || "…" }]);
      } catch (e) {
        setHistory([{ role: "assistant", content: "I couldn’t start the chat right now." }]);
      } finally {
        setLoading(false);
      }
    };

    prime();
  }, []);

  // user sends a message -> same endpoint
  const send = async (message) => {
    if (!message?.trim()) return;
    setLoading(true);
    setHistory((h) => [...h, { role: "user", content: message }]);

    try {
      const res = await fetch(`${API}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `caregiver_${(topic || "general").replace(/\s+/g, "_")}`,
          message,
        }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { role: "assistant", content: data.reply || "…" }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: "Hmm, I couldn’t fetch a reply." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Caregiver — Chat</h2>
        <a className="btn btn-outline-secondary btn-sm" href="/caregiver-dash">← Back</a>
      </div>

      <div className="text-muted mb-2">Topic: {topic || "caregiver"}</div>

      <div
        className="p-3 mb-3 border rounded"
        style={{ height: "55vh", overflowY: "auto", background: "#f8f9fa" }}
      >
        {history.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === "user" ? "text-end" : "text-start"}`}>
            <span
              className={`d-inline-block px-3 py-2 rounded-3 ${
                m.role === "user" ? "bg-primary text-white" : "bg-white border"
              }`}
              style={{ maxWidth: "75%", whiteSpace: "pre-wrap" }}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-start">
            <span className="px-3 py-2 rounded-3 bg-white border">Ally is typing…</span>
          </div>
        )}
      </div>

      <form
        className="d-flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput("");
        }}
      >
        <input
          className="form-control"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
