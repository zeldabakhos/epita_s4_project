const User = require("../models/userModels.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/users/signup
// POST /api/users/signup
exports.userSignUp = async (req, res) => {
  const { 
    firstName, lastName, email, password,
    diagnosis, cancerStage, treatments, allergies,
    role
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "patient",
      diagnosis,
      cancerStage,
      treatments,
      allergies,
    });

    // Save caregiver first
    const savedUser = await newUser.save();

    if (savedUser.role === "caregiver") {
      const patient = await User.findOne({ invitations: savedUser.email });
      if (!patient) {
        return res.status(403).json({ message: "This caregiver email was not invited by any patient" });
      }
    
      savedUser.linkedPatient = patient._id;   
      await savedUser.save();
    
      patient.caregivers.push(savedUser._id);
      patient.invitations = patient.invitations.filter((e) => e !== savedUser.email);
      await patient.save();
    }

    res.status(201).json({
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      patient: savedUser.patient || null,
      diagnosis: savedUser.diagnosis || null,
      cancerStage: savedUser.cancerStage || null,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Signup failed" });
  }
};

// POST /api/users/login
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
        role: foundUser.role,
        linkedPatient: foundUser.linkedPatient || null,   // 🔑 consistent
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

// POST /api/users/invite-caregiver (protected, patient only)
// POST /api/users/invite-caregiver
// POST /api/caregivers/invite
// POST /api/caregivers/invite
exports.inviteCaregiver = async (req, res) => {
  try {
    const patientId = req.userId;
    const { caregiverEmail } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(403).json({ message: "Only patients can invite caregivers" });
    }

    const email = caregiverEmail.toLowerCase().trim();

    // If caregiver already exists, link immediately
    let caregiver = await User.findOne({ email, role: "caregiver" });
    if (caregiver) {
      caregiver.patient = patient._id;
      await caregiver.save();

      if (!patient.caregivers.includes(caregiver._id)) {
        patient.caregivers.push(caregiver._id);
      }
    } else {
      // Caregiver doesn’t exist yet → store invitation
      if (!patient.invitations.includes(email)) {
        patient.invitations.push(email);
      }
    }

    await patient.save();

    res.json({ message: "Caregiver invited successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to invite caregiver" });
  }
};

