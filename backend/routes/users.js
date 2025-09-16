const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { userLogin, userSignUp, getMe, updateMe } = require("../controllers/userControllers");
const validate = require("../middleware/validate");
const schemas = require("../validators/userSchemas");

// Auth
router.post("/signup", validate(schemas.signup), userSignUp);
router.post("/login", validate(schemas.login), userLogin);

// Profile
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);

module.exports = router;
