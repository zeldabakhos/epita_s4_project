const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");
const { userLogin, userSignUp, getMe, updateMe } = require("../controllers/userControllers");

// Auth
router.post("/signup", userSignUp);
router.post("/login", userLogin);

// Profile
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);

module.exports = router;
