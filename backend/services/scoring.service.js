// /backend/services/scoring.service.js
function computeScore(answers, questionsById) {
    let total = 0;
    for (const a of answers) {
      const q = questionsById[a.questionId];
      const weight = q?.weight ?? 1;
      total += (a.value || 0) * weight;
    }
    return total;
  }
  
  function bandSeverity(score) {
    if (score <= 4) return 'none';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }
  
  // Unlock only if all required questions were answered
  function shouldUnlock(answers, questionsById) {
    const requiredIds = Object.values(questionsById)
      .filter(q => q.required)
      .map(q => String(q._id));
    const answeredRequired = new Set(answers.map(a => String(a.questionId)));
    return requiredIds.every(id => answeredRequired.has(id));
  }
  
  module.exports = { computeScore, bandSeverity, shouldUnlock };
  