const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { 
  userLogin, 
  userSignUp, 
  getMe, 
  updateMe, 
  inviteCaregiver // <-- NEW
} = require("../controllers/userControllers");
const validate = require("../middleware/validate");
const schemas = require("../validators/userSchemas");

// Auth
router.post("/signup", validate(schemas.signup), userSignUp);
router.post("/login", validate(schemas.login), userLogin);

// Profile
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);

// Caregiver invite (patients only)
router.post("/invite-caregiver", verifyToken, inviteCaregiver);

module.exports = router;
