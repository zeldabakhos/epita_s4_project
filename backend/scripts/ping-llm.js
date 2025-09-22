const { loadModel } = require("gpt4all");
const fs = require("node:fs");

(async () => {
  try {
    const abs = process.env.GPT4ALL_MODEL || "/app/models/tinyllama-1.1b-chat-v1.0.Q2_K.gguf";
    if (!fs.existsSync(abs)) throw new Error("Model not found: " + abs);

    const m = await loadModel(abs, { allowDownload: false, verbose: true });
    const out = await m.prompt("User: Say 'hello' in one short sentence.\nAssistant:", { nPredict: 32 });
    console.log("REPLY:", String(out).trim());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
