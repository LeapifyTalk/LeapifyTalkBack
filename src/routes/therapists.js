const express = require("express");
const {
  createTherapist,
  loginTherapist,
  sendOtp,
  verifyEmail,
  verifyOtp,
  verifyLoginOtp,
  loginByOtp,
  forgotPasswordTherapist,
  verifyresetPasswordTherapist,
  editDetails,
  resetPassword,
  getDashboard,
  myCourses,
  logout,
  instCourses,
  getStats,
  resendOtp,
  getOneInstructor,
  getInstructors,
  searchBar,
} = require("../controllers/therapist");
const { auth, adminAuth } = require("../middlewares/auth");
const upload = require("../utils/s3");
const router = express.Router();

router.post("/register", createTherapist);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginTherapist);

router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/login-otp", loginByOtp);
router.post("/verify-login", verifyLoginOtp);

router.get("/get-instructor/:id", getOneInstructor);
router.get("/get-instructors", getInstructors);
router.get("/therapist-dashboard", auth, getDashboard);
router.get("/stats", auth, getStats);

router.post("/forgot-password", forgotPasswordTherapist);
// router.get("/verify-reset-password/:token", verifyresetPasswordTherapist);
router.post("/reset-password/:token", resetPassword);
router.put("/edit-details", auth, upload.single("photo"), editDetails);
router.get("/my-courses", auth, myCourses);
router.post("/logout", auth, logout);
router.get("/inst-courses/:id", instCourses);
// ===========Dashboard============
router.get("/search-bar", searchBar);

module.exports = router;
