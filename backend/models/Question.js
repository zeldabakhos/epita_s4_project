// /backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // e.g., "mood", "sleep"
    type: { type: String, enum: ['mcq', 'scale'], default: 'scale' },
    options: [{ label: String, value: Number }], // numeric values for scoring
    required: { type: Boolean, default: true },
    weight: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
