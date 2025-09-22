// /backend/routes/mood.routes.js
const express = require('express');
const moodCtrl = require('../controllers/mood.controller');
const { verifyToken } = require("../middleware/auth");
const { createMoodEntry } = require("../controllers/mood.controller");


const router = express.Router();

router.get('/questions', moodCtrl.getQuestions);
router.post('/seed', moodCtrl.seedQuestions);

// keep entries public (expects userId in body)
router.post("/entries", verifyToken, createMoodEntry);
router.get('/entries/latest', moodCtrl.getLatestEntry);

module.exports = router;
