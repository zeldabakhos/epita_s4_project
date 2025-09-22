const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    role:      { type: String, enum: ["patient", "caregiver"], required: true, default: "patient" },

    // 🔽 caregiver/patient linking
    linkedPatient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
    caregivers:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],              
    invitations:   [{ type: String, lowercase: true, trim: true }],                      

    // patient medical fields
    diagnosis:   { type: String },
    cancerStage: { type: String },
    treatments:  [{ type: String }],
    allergies:   [{ type: String }],
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
