const User = require("../models/userModels");
const Mood = require("../models/MoodEntry");

// POST /api/caregivers/invite
exports.inviteCaregiver = async (req, res) => {
    try {
      const patientId = req.userId;
      const { caregiverEmail } = req.body;
  
      const patient = await User.findById(patientId);
      if (!patient || patient.role !== "patient") {
        return res.status(403).json({ message: "Only patients can invite caregivers" });
      }
  
      const normalizedEmail = caregiverEmail.toLowerCase().trim();
  
      // If caregiver already exists, link immediately
      let caregiver = await User.findOne({ email: normalizedEmail, role: "caregiver" });
      if (caregiver) {
        caregiver.linkedPatient = patient._id;   // ✅ use linkedPatient consistently
        await caregiver.save();
  
        if (!patient.caregivers.includes(caregiver._id)) {
          patient.caregivers.push(caregiver._id);
        }
      } else {
        // Caregiver doesn’t exist yet → store invitation
        if (!patient.invitations.includes(normalizedEmail)) {
          patient.invitations.push(normalizedEmail);
        }
      }
  
      await patient.save();
  
      res.json({ message: "Caregiver invited successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to invite caregiver" });
    }
  };
  

// GET /api/caregivers/patient-mood
exports.getPatientMood = async (req, res) => {
  try {
    const caregiver = await User.findById(req.userId);
    if (!caregiver || caregiver.role !== "caregiver") {
      return res.status(403).json({ message: "Only caregivers can access this" });
    }

    if (!caregiver.linkedPatient) {
      return res.status(404).json({ message: "No patient linked to this caregiver" });
    }

    const latestMood = await Mood.findOne({ userId: caregiver.linkedPatient })
        .sort({ createdAt: -1 })
        .lean();

    if (!latestMood) {
      return res.status(404).json({ message: "Patient has no mood records yet" });
    }

    res.json(latestMood);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patient mood" });
  }
};
