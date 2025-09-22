// /backend/services/scoring.service.js
function computeScore(answers, questionMap = {}) {
  let score = 0;

  for (const ans of answers) {
    const q = questionMap[ans.questionId];
    if (!q) continue;

    // Find index of the chosen label in the question options
    const idx = q.options.findIndex((opt) =>
      typeof opt === "string"
        ? opt === ans.value
        : opt.label === ans.value || opt.value === ans.value
    );

    if (idx >= 0) {
      score += typeof q.options[idx] === "object"
        ? q.options[idx].value   // numeric defined in schema
        : idx;                   // fallback: use index
    }
  }

  return score;
}

function bandSeverity(score) {
  if (score < 3) return "none";
  if (score < 6) return "mild";
  if (score < 9) return "moderate";
  return "severe";
}

function shouldUnlock(answers) {
  // Example: unlock if any bad moods detected
  return answers.some((ans) =>
    ["Very low", "Low", "Severe", "Poor"].includes(ans.value)
  );
}

module.exports = { computeScore, bandSeverity, shouldUnlock };
