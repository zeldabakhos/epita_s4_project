const User = require("../models/userModels.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/users/signup
exports.userSignUp = async (req, res) => {
  const { firstName, lastName, email, password, diagnosis, cancerStage, treatments, allergies } = req.body;

  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      diagnosis,
      cancerStage,
      treatments,
      allergies,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      diagnosis: savedUser.diagnosis || null,
      cancerStage: savedUser.cancerStage || null,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Signup failed" });
  }
};

// POST /api/users/login
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, foundUser.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: foundUser._id }, process.env.SECRET_TOKEN_KEY, { expiresIn: "24h" });

    res.status(200).json({
      token,
      user: {
        id: foundUser._id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        diagnosis: foundUser.diagnosis || null,
        cancerStage: foundUser.cancerStage || null,
        treatments: foundUser.treatments || [],
        allergies: foundUser.allergies || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// GET /api/users/me (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /api/users/me (protected)
exports.updateMe = async (req, res) => {
  try {
    const updatable = ["firstName", "lastName", "diagnosis", "cancerStage", "treatments", "allergies"];
    const updates = {};
    for (const k of updatable) if (k in req.body) updates[k] = req.body[k];

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};
