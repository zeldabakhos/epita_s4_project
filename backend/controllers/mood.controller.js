// /backend/controllers/mood.controller.js
const mongoose = require('mongoose');
const Question = require('../models/Question');
const MoodEntry = require('../models/MoodEntry');
const { computeScore, bandSeverity, shouldUnlock } = require('../services/scoring.service');

// GET /api/mood/questions
const getQuestions = async (_req, res, next) => {
  try {
    const qs = await Question.find({}).sort({ createdAt: 1 }).lean();
    res.json(qs);
  } catch (e) {
    next(e);
  }
};

// POST /api/mood/seed  (one-time setup)
const seedQuestions = async (_req, res, next) => {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      return res.json({ ok: true, note: 'Questions already exist' });
    }

    const base = [
      {
        text: 'Overall mood today',
        key: 'mood',
        type: 'scale',
        options: [
          { label: 'Very low', value: 0 },
          { label: 'Low', value: 1 },
          { label: 'OK', value: 2 },
          { label: 'Great', value: 3 }
        ],
        required: true,
        weight: 1
      },
      {
        text: 'Anxiety level',
        key: 'anxiety',
        type: 'scale',
        options: [
          { label: 'None', value: 0 },
          { label: 'Mild', value: 1 },
          { label: 'Moderate', value: 2 },
          { label: 'Severe', value: 3 }
        ],
        required: true,
        weight: 1
      },
      {
        text: 'Sleep quality',
        key: 'sleep',
        type: 'scale',
        options: [
          { label: 'Poor', value: 0 },
          { label: 'Fair', value: 1 },
          { label: 'Good', value: 2 },
          { label: 'Excellent', value: 3 }
        ],
        required: true,
        weight: 1
      }
    ];

    await Question.insertMany(base);
    res.json({ ok: true, inserted: base.length });
  } catch (e) {
    next(e);
  }
};

// CREATE mood entry
const createMoodEntry = async (req, res) => {
  try {
    const userId = req.userId; // from verifyToken
    const answers = req.body.answers;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers object required" });
    }

    const score = computeScore(answers);
    const severity = bandSeverity(score);
    const unlockChatbot = shouldUnlock(answers);

    const entry = await MoodEntry.create({
      userId,
      answers,
      score,
      severity,
      unlockChatbot,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save mood entry" });
  }
};

// LATEST mood entry
const getLatestEntry = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const doc = await MoodEntry.findOne({ userId }).sort({ createdAt: -1 }).lean();
    if (!doc) {
      return res.status(404).json({ error: 'No entries yet' });
    }

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mood entry" });
  }
};

module.exports = {
  getQuestions,
  seedQuestions,
  createMoodEntry,   // ✅ fixed
  getLatestEntry
};
