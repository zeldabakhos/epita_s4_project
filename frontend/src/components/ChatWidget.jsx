// src/components/ChatWidget.jsx
import { useEffect, useRef, useState, useMemo } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------- System prompt built from the mood (persistent in history) ---------- */
function buildSystemFromMood(mood = {}) {
  const line = [
    `overallMood: ${mood.overallMood ?? "unknown"}`,
    `anxiety: ${mood.anxiety ?? "unknown"}`,
    `sleep: ${mood.sleep ?? "unknown"}`,
    `energy: ${mood.energy ?? "unknown"}`,
    `pain: ${mood.pain ?? "unknown"}`,
    `appetite: ${mood.appetite ?? "unknown"}`
  ].join("; ");

  return `
You are Ally, a compassionate oncology support buddy.

Context (today's check-in):
${line}

Style:
- Warm, brief, practical. Use one-paragraph answers or short bullets.
- Suggest *tiny* actions (1–10 minutes). Make them specific, not generic.
- Personalize suggestions to the mood context above.

Behavior:
- On every first reply and whenever the user asks to “do something”, propose 3–5 tiny, concrete options.
- Ask the user to choose one option or say “something else”.
- Only suggest scheduling a follow-up if the *user* asks for it.
- If the user is hostile/insulting, respond calmly once: acknowledge feelings, set a soft boundary (no insults), and redirect to a practical step (do not scold or lecture).
- Avoid medical directives; say “ask the care team” for clinical questions.

Format:
- Prefer short bullets (•) with one sentence each when listing actions.
- End with: “Which one feels doable?”
`.trim();
}

/* ---------- Friendly greeting (UI only) ---------- */
function buildGreeting(mood = {}) {
  if (!mood || !Object.keys(mood).length) {
    return "Hi! I’m Ally 🫶\nHow are you feeling right now? I can help you reflect, plan, or just vent.";
  }
  const pairs = Object.entries(mood).map(([k, v]) => `${k}: ${v}`).join("; ");
  return `Hi! I’m Ally 🫶\nI see your check-in today: _${pairs}_. Want to talk about it or plan one tiny action?`;
}

/* ---------- Tiny step chips generated from mood ---------- */
function tinyStepsFromMood(mood = {}) {
  const steps = [];

  const low = (v) => String(v || "").toLowerCase().includes("low");
  const veryLow = (v) => String(v || "").toLowerCase().includes("very low");
  const mildUp = (v) => ["mild", "fair", "okay", "ok"].some(t => String(v||"").toLowerCase().includes(t));
  const highAnx = (v) => ["moderate", "severe"].some(t => String(v||"").toLowerCase().includes(t));
  const poorSleep = (v) => String(v || "").toLowerCase().includes("poor");
  const painSome = (v) => ["mild","moderate","severe"].some(t => String(v||"").toLowerCase().includes(t));

  if (veryLow(mood.overallMood) || low(mood.energy)) {
    steps.push("2-minute body scan + 4 slow breaths");
    steps.push("Open blinds, sip water, stand and stretch 30s");
  }
  if (highAnx(mood.anxiety)) {
    steps.push("Box breathing: 4-4-4-4 for 1 minute");
    steps.push("Write 3 worries, circle the one I can influence");
  }
  if (poorSleep(mood.sleep)) {
    steps.push("Tonight: dim screens 30 min earlier");
  }
  if (painSome(mood.pain)) {
    steps.push("Ask care team about pain plan next visit");
  }
  if (low(mood.appetite)) {
    steps.push("Nibble a cracker + sip ginger tea");
  }
  if (steps.length < 3) {
    steps.push("Text a friend: “thinking of you—no need to reply”");
    steps.push("Queue a 2-minute song and move gently");
    steps.push("Fill a glass of water and take 5 sips");
  }
  // return max 5 unique
  return [...new Set(steps)].slice(0, 5);
}

export default function ChatWidget({ open = true, onClose, moodContext }) {
  const [history, setHistory] = useState([]); // includes a hidden {role:'system'}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const listRef = useRef(null);

  // stable system prompt from mood
  const system = useMemo(() => buildSystemFromMood(moodContext || {}), [moodContext]);

  // ensure system message exists in history
  useEffect(() => {
    setHistory((h) => (h.some(m => m.role === "system") ? h : [{ role: "system", content: system }]));
  }, [system]);

  // auto-scroll
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, history]);

  if (!open) return null;

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setErr("");

    // keep system in outgoing payload
    const withSystem = history.some(m => m.role === "system")
      ? history
      : [{ role: "system", content: system }, ...history];

    const nextHistory = [...withSystem, { role: "user", content: message }];
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

  const renderable = history.filter((m) => m.role !== "system");
  const chips = useMemo(() => tinyStepsFromMood(moodContext || {}), [moodContext]);

  return (
    <div className="d-flex flex-column" style={{ height: "70vh" }}>
      <div
        ref={listRef}
        className="p-3"
        style={{ flex: 1, overflowY: "auto", background: "linear-gradient(180deg,#fff,#f8f9fa)" }}
      >
        {renderable.length === 0 && (
          <div className="alert alert-light border" style={{ whiteSpace: "pre-wrap" }}>
            {buildGreeting(moodContext || {})}
          </div>
        )}

        {renderable.map((m, i) => (
          <div
            key={i}
            className={`d-flex ${m.role === "user" ? "justify-content-end" : "justify-content-start"} mb-2`}
          >
            <div
              className={`px-3 py-2 rounded-3 ${m.role === "user" ? "text-white bg-dark" : "bg-white border"}`}
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

      {/* quick action chips */}
      {chips.length > 0 && (
        <div className="px-2 pt-2 d-flex flex-wrap gap-2 border-top bg-white">
          {chips.map((c, i) => (
            <button
              key={i}
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => send(`Let's try: ${c}`)}
              style={{ whiteSpace: "nowrap" }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

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
