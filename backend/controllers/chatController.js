// backend/controllers/chatController.js
const fetch = require("node-fetch");

function systemPrompt(mood = {}) {
  const bits = [
    "You are Ally, a warm, friendly well-being companion (not a clinician).",
    "Keep replies short. Offer ONE tiny, practical action (≤ 5 minutes). No medical advice.",
  ];
  if (mood && Object.keys(mood).length) {
    bits.push("Today’s check-in:");
    for (const [k, v] of Object.entries(mood)) bits.push(`- ${k}: ${v}`);
  }
  bits.push("Structure: 1) brief validation 2) • one tiny step 3) gentle follow-up question.");
  return bits.join("\n");
}

async function chatHandler(req, res) {
  try {
    const { message, history = [], moodContext = {} } = req.body || {};
    if (!message) return res.status(400).json({ error: "message is required" });

    // build transcript
    const transcript = [
      `System: ${systemPrompt(moodContext)}`,
      ...history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
      `User: ${message}`,
      "Assistant:",
    ].join("\n");

    // call llama-server
    const response = await fetch("http://host.docker.internal:11434/completion", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: transcript,
        n_predict: 256,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`llama-server error: ${response.statusText}`);
    }

    const data = await response.json();

    res.json({ reply: (data.content || "").trim() });
  } catch (e) {
    console.error("/api/chat", e);
    res.status(500).json({ error: "Chat failed" });
  }
}

module.exports = { chatHandler };
