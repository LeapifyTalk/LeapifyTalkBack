const express = require("express");
const router = express.Router();
const upload = require("../utils/s3");

const {
  signUpCompanion,
  signUpDoctor,
  signUpTherapist,
  signUpUser,
  forgotPassword,
  forgotPasswordVerify,
  resetPassword,
  login,
  verifyMail,
  postRating,
  postReview,
  logout,
  companionHome,
  getCompanions,
  editCompanion,
  getOneCompanion,
} = require("../controllers/companion");
const { auth } = require("../middlewares/auth");

router.post("/companion", signUpCompanion);
router.post("/doctor", signUpDoctor);
router.post("/user", signUpUser);
router.post("/therapist", signUpTherapist);
router.get("/verify-email/:token", verifyMail);
router.post("/forgot-password", forgotPassword);
router.get("/forgot-password/:token", forgotPasswordVerify);
router.post("/reset-password", resetPassword);
router.get("/get-companions", getCompanions);
router.get("/get-companion/:id", getOneCompanion);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/companion-dashboard", auth, companionHome);
router.post("/edit-companion", upload.single("photo"), auth, editCompanion);
router.post("/post-rating/:id", auth, postRating);
router.post("/post-review/:id", auth, postReview);

router.get("/home", auth, companionHome);

module.exports = router;
