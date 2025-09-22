import { useEffect, useState } from "react";
import ResourcesForm from "../components/ResourcesForm";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResourcesPage() {
  const [topic, setTopic] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // function to send messages (user OR initial)
  const send = async (message) => {
    if (!topic) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, message }),
      });
      const data = await res.json();

      if (message) {
        setHistory((h) => [
          ...h,
          { role: "user", content: message },
          { role: "assistant", content: data.reply || "…" },
        ]);
      } else {
        // initial AI message
        setHistory([{ role: "assistant", content: data.reply || "…" }]);
      }
    } catch (e) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: "Hmm, I couldn’t fetch resources right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // when topic changes, auto trigger first AI response
  useEffect(() => {
    if (topic) send(null); // null means "initial message"
  }, [topic]);

  if (!topic) {
    return <ResourcesForm onSelect={setTopic} />;
  }

  return (
    <div className="container py-3">
      <h2 className="mb-3">Resources — {topic.replace("_", " ")}</h2>
      <div
        className="p-3 mb-3 border rounded"
        style={{ height: "50vh", overflowY: "auto", background: "#f8f9fa" }}
      >
        {history.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === "user" ? "text-end" : "text-start"}`}
          >
            <span
              className={`d-inline-block px-3 py-2 rounded-3 ${
                m.role === "user" ? "bg-primary text-white" : "bg-white border"
              }`}
              style={{ maxWidth: "75%" }}
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
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
