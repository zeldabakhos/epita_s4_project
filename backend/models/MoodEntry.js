// /backend/models/MoodEntry.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    value: { type: Number, required: true } // map MCQ/scale to numeric
  },
  { _id: false }
);

const MoodEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // later: derive from auth token
    answers: { type: [AnswerSchema], required: true },
    score: { type: Number, required: true },
    severity: { type: String, enum: ['none', 'mild', 'moderate', 'severe'], required: true },
    unlockChatbot: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
