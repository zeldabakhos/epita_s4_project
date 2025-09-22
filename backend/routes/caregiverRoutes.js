const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { inviteCaregiver, getPatientMood } = require("../controllers/caregiverController");

const router = express.Router();

router.post("/invite", verifyToken, inviteCaregiver);
router.get("/patient-mood", verifyToken, getPatientMood);

module.exports = router;
