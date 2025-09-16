// /backend/routes/mood.routes.js
const express = require('express');
const moodCtrl = require('../controllers/mood.controller');

const router = express.Router();

router.get('/questions', moodCtrl.getQuestions);
router.post('/seed', moodCtrl.seedQuestions);

// keep entries public (expects userId in body)
router.post('/entries', moodCtrl.createEntry);
router.get('/entries/latest', moodCtrl.getLatestEntry);

module.exports = router;
