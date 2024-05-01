const express = require("express");
const { adminAuth, auth } = require("../middlewares/auth");
const upload = require("../utils/s3");
const {
  newCourse,
  popCourses,
  editCourse,
  allCourses,
  addSection,
  delCourse,
  addInstructor,
  getInstructors,
  getCourseById,
  getCompanionCourseById,
  getReviews,
  getOneInstructor,
  delInstructor,
  ongoingCourse,
  getByCategory,
  getTags,
  getCompleteCourse,
  getBySubCategory,
  getSection,
  buyCourse,
  successBuy,
  postRating,
  getOngoingCourse,
  purchasedCourses,
  cancelBuy,
  searchCourse,
} = require("../controllers/course");
const course = require("../models/course");
const router = express.Router();

// ===========Courses=========
const uploadFiles = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "doc", maxCount: 1 },
  { name: "photo", maxCount: 1 },
]);
// search bar of therapist same as myCourses,
router.post("/new-course", auth, uploadFiles, newCourse);
router.get("/popular", popCourses);
router.get("/all-courses", allCourses);
router.get("/get-companion-courses/:id", getCompanionCourseById);
router.get("/get-courses/:id", getCourseById);
router.get("/get-reviews/:id", getReviews);
router.get("get-tags", getTags);
router.get("/search-course", searchCourse);
router.put("/edit-course/:id", auth, uploadFiles, editCourse);
router.post("/add-section/:id", auth, uploadFiles, addSection);
router.get("/get-section/:id", auth, getSection);
router.delete("/delete-course/:id", auth, delCourse);
router.get("/purchased-courses", auth, purchasedCourses);
router.post("/ongoing-courses", auth, ongoingCourse);
router.get("/ongoing-courses", auth, getOngoingCourse);
router.get("/complete-courses", auth, getCompleteCourse);
router.post("/post-rating", auth, postRating);
// =========Buy Course========
router.post("/buy-course", auth, buyCourse);
router.get("/success", successBuy);
router.get("/cancel", auth, cancelBuy);
//
module.exports = router;
