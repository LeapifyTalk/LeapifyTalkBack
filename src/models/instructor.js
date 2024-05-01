const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const instructor = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  courses: [
    {
      ref: "course",
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
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  photo_url: {
    type: String,
  },
  password: {
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
});

const instructor1 = mongoose.model("instructor", instructor);
module.exports = instructor1;
