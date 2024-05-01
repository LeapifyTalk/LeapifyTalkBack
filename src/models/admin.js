const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const admin = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    age: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    emailToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedForPasswordReset: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: {
      type: String,
    },
  },
  { timestamp: true }
);

const model = mongoose.model("Admin", admin);

module.exports = model;
