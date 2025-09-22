const fetch = require("node-fetch");

function resourcePrompt(topic) {
  const base = [
    "You are Ally, a warm, supportive well-being companion (not a clinician).",
    "Answer briefly, kindly, and with encouragement.",
    "Offer 1–2 practical suggestions or insights related to the chosen topic.",
    "Never give medical advice — just supportive info, ideas, or coping strategies.",
    "Keep answers short (2–4 sentences), friendly, and clear."
  ];

  switch (topic) {
    case "hair_loss":
      base.push("The user is struggling with hair loss during cancer treatment. Provide emotional support, normalize the experience, and suggest gentle coping ideas (e.g., scarves, hats, self-expression).");
      break;
    case "yoga_exercises":
      base.push("The user is interested in simple yoga exercises. Suggest safe, light practices (stretching, breathing, relaxation). Do not give medical exercise prescriptions.");
      break;
    case "pet_scan":
      base.push("The user is anxious about a PET scan. Explain in a supportive, simple way what to expect, and suggest calming techniques.");
      break;
    case "chemo_bored":
      base.push("The user feels bored during chemo sessions. Suggest light, engaging activities (music, reading, journaling, small crafts, connecting with friends).");
      break;
    case "nutrition":
      base.push("The user wants ideas about nutrition. Share general, gentle advice (hydration, balanced snacks) without medical recommendations.");
      break;
    case "sleep":
      base.push("The user struggles with sleep. Share simple sleep hygiene ideas (limit screens, calming routine, breathing).");
      break;
    default:
      base.push("The user has a concern. Offer emotional support and practical, safe suggestions.");
  }

  return base.join("\n");
}

async function resourcesHandler(req, res) {
    try {
      const { topic, message } = req.body || {};
      if (!topic) return res.status(400).json({ error: "topic is required" });
  
      // If no message → create a custom opening line for the AI
      const userMessage = message || "Introduce the topic gently and start the conversation without waiting for input.";
  
      const prompt = `${resourcePrompt(topic)}\n\nUser: ${userMessage}\nAssistant:`;
  
      const response = await fetch("http://host.docker.internal:11434/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          n_predict: 200,
          temperature: 0.8,
        }),
      });
  
      if (!response.ok) throw new Error(`llama-server error: ${response.statusText}`);
      const data = await response.json();
  
      res.json({ reply: (data.content || "").trim() });
    } catch (e) {
      console.error("/api/resources", e);
      res.status(500).json({ error: "Resources chat failed" });
    }
  }
  

module.exports = { resourcesHandler };
