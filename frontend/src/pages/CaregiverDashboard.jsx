// pages/CaregiverDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CaregiverDashboard() {
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(localStorage.getItem("linkedPatient") || "");
  const [patientMood, setPatientMood] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");

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
        } else {
          const msg = "No patient linked yet. Ask the patient to invite this email.";
          setError(msg);
        }
      } catch (e) {
        setError("Could not load your profile.");
        console.error(e);
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchMood = async () => {
      if (!patientId) return;
      try {
        const res = await fetch(
          `${API}/api/mood/entries/latest?userId=${patientId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        if (res.ok) setPatientMood(data);
        else {
          const msg = data.message || data.error || "No mood data yet.";
          setError(msg);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to fetch patient mood.");
      }
    };
    fetchMood();
  }, [patientId]);

  const topics = [
    { val: "emotional support", label: "Emotional support & empathy" },
    { val: "what to say", label: "What to say / conversation starters" },
    { val: "practical help", label: "Practical help at home (meals, chores, rides)" },
    { val: "chemo visit", label: "Making chemo/infusion days easier" },
    { val: "appointments", label: "Coordinating appointments & notes" },
    { val: "meds & symptoms", label: "Helping with meds & symptom tracking" },
    { val: "body image", label: "Hair loss & body-image sensitivity" },
    { val: "motivation", label: "Keeping motivation without toxic positivity" },
    { val: "sleep & routine", label: "Sleep / gentle routines" },
    { val: "caregiver self-care", label: "Caregiver self-care & boundaries" },
  ];

  const systemPrompt = useMemo(() => {
    const pairs = patientMood?.answers
      ? Object.fromEntries(patientMood.answers.map(a => [a.questionId, a.value]))
      : {};
    return `
You are an oncology caregiver coach. Speak in warm, concise, *practical* language.
Audience: a family caregiver (non-clinician). Provide specific, actionable suggestions.

Patient context (if available):
- overallMood: ${pairs.overallMood ?? "unknown"}
- anxiety: ${pairs.anxiety ?? "unknown"}
- sleep: ${pairs.sleep ?? "unknown"}
- energy: ${pairs.energy ?? "unknown"}
- pain: ${pairs.pain ?? "unknown"}
- appetite: ${pairs.appetite ?? "unknown"}

Rules:
- Offer 5–7 concrete actions the caregiver can try today (bulleted, each ≤ 1 sentence).
- Include 3 empathetic example phrases (quoted).
- Include 2 safety checks (when to call the care team).
- Include 3 mini self-care ideas for the caregiver (≤ 10 minutes).
- End with one “first tiny step” the caregiver can do in under 2 minutes.
- Avoid medical directives; say “ask the care team” for clinical questions.
`.trim();
  }, [patientMood]);

  const openingForTopic = (topic) => {
    const pairs = patientMood?.answers
      ? Object.fromEntries(patientMood.answers.map(a => [a.questionId, a.value]))
      : {};
    return [
      `Please coach me as a family caregiver about: ${topic}.`,
      `Patient context → overallMood: ${pairs.overallMood ?? "unknown"},`,
      `anxiety: ${pairs.anxiety ?? "unknown"}, sleep: ${pairs.sleep ?? "unknown"},`,
      `energy: ${pairs.energy ?? "unknown"}, pain: ${pairs.pain ?? "unknown"},`,
      `appetite: ${pairs.appetite ?? "unknown"}.`,
      `I need practical ideas, what to say, and two quick self-care tips for me.`
    ].join(" ");
  };

  const askCoach = async (topic) => {
    if (!topic) return;
    setLoadingAI(true);
    setAiResponse("");

    const system = systemPrompt;
    const user = `Caregiver coaching topic: ${topic}`;

    try {
      // First try /api/ai/chat (messages[])
      const r1 = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (r1.ok) {
        const j = await r1.json();
        setAiResponse(j.reply || j.message || j.output || j.content || "No coaching available yet.");
        return;
      }

      // Fallback to /api/resources
      const r2 = await fetch(`${API}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `caregiver_${topic.replace(/\s+/g, "_")}`,
          message: openingForTopic(topic),
        }),
      });

      const j2 = await r2.json();
      if (r2.ok) {
        setAiResponse(j2.reply || "No coaching available yet.");
      } else {
        setAiResponse(j2.message || "Could not get coaching right now.");
      }
    } catch (e) {
      console.error(e);
      setAiResponse("Could not get coaching right now.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) askCoach(selectedTopic);
  }, [selectedTopic]);

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
      const t = String(v || "").toLowerCase();
      if (["very low", "poor", "severe", "exhausted"].some(x => t.includes(x))) return "danger";
      if (["low", "mild", "fair"].some(x => t.includes(x))) return "warning";
      if (["ok", "okay", "normal"].some(x => t.includes(x))) return "secondary";
      if (["great", "good", "excellent", "energized", "strong", "none"].some(x => t.includes(x))) return "success";
      return "secondary";
    };
    const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    const pairs = Object.fromEntries(entry.answers.map(a => [a.questionId, a.value]));
    const tiles = ["overallMood","anxiety","sleep","energy","pain","appetite"];

    return (
      <div className="mood-card">
        <div className="mood-card__header">
          <div>
            <div className="mood-card__title">Patient’s mood</div>
            <div className="mood-card__meta">Latest check-in • {fmt(entry.createdAt || entry.updatedAt || Date.now())}</div>
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

  const continueInChat = () => {
    localStorage.setItem("caregiverTopic", selectedTopic || "");
    localStorage.setItem("caregiverSystem", systemPrompt);
    if (patientMood?.answers) {
      const pairs = Object.fromEntries(patientMood.answers.map(a => [a.questionId, a.value]));
      localStorage.setItem("caregiverMoodPairs", JSON.stringify(pairs));
    }
    navigate("/caregiver-chat");
  };

  return (
    <div className="container py-4">
      <h2>Caregiver Dashboard</h2>

      {error && <div className="alert alert-warning">{error}</div>}

      <section className="mb-4">
        <MoodCard entry={patientMood} />
        {!patientMood && (
          <p className="text-muted">{patientId ? "No mood data yet." : "Linking patient..."}</p>
        )}
      </section>

      <section className="card p-3">
        <h4 className="mb-3">Caregiver Coaching</h4>

        <select
          className="form-select mb-3"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Pick a coaching topic</option>
          {topics.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
        </select>

        {loadingAI && <div className="alert alert-secondary">Ally is preparing personalized ideas…</div>}

        {aiResponse && (
          <div className="alert alert-info">
            <div className="fw-semibold mb-2">Ally</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{aiResponse}</div>
            <div className="mt-3">
              <button className="btn btn-outline-primary btn-sm" onClick={continueInChat}>
                Continue in full chat →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
