const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    // accept plain string keys instead of ObjectId
    questionId: { type: String, required: true },
    // accept plain string answers instead of Number
    value: { type: String, required: true }
  },
  { _id: false }
);

const MoodEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    answers: { type: [AnswerSchema], required: true },
    score: { type: Number, required: true },
    severity: { type: String, enum: ['none', 'mild', 'moderate', 'severe'], required: true },
    unlockChatbot: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
