const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const therapist = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    role: {type : String},
    phone: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      unique: false,
    },
    registerToken: {
      type: String,
      default: null,
    },
    verifiedUser: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
      default: null,
    },
    courses: [
      {
        ref: "courses",
        type: Schema.Types.ObjectId,
      },
    ],
    about_instructor: {
      type: String,
    },
    salary: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    certification: {
      type: String,
      default: "UGC",
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    photo_url: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    tokens: {
      type: String,
    },
    otp: {
      type: String,
    },
    loginOtp: {
      type: String,
    },
    timeOtpSent: {
      type: Number,
    },
    registered: {
      type: Boolean,
      default: false,
    },
    timeLoginOtpSent: {
      type: Number,
    },
    loggedIn: {
      type: Boolean,
      default: false,
    },
    verifiedForPasswordReset: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    notApproved: {
      type: Boolean,
    },
    onHold: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const therapist1 = mongoose.model("therapist", therapist);
module.exports = therapist1;
