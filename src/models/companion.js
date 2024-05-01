const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const companionSchema = new mongoose.Schema(
  {
    name: { type: String },
    mobile: { type: String },
    gender: { type: String },
    address: { type: String },
    password: { type: String },
    role: { type: String },
    registerToken: { type: String },
    email: { type: String, unique: true },
    isVerified: { type: Boolean, default: false },
    tokens: { type: String },
    resetPasswordToken: { type: String },
    verifiedForPasswordReset: { type: Boolean, default: false },
    assigned_courses: [
      {
        ref: "courses",
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const model = mongoose.model("companion", companionSchema);

module.exports = model;
