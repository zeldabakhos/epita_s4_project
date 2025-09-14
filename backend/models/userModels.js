const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    diagnosis: { type: String },           
    cancerStage: { type: String },         
    treatments: [{ type: String }],        
    allergies: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
