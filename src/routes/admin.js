const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  approveTherapist,
  approveCourse,
  getTherapists,
  getCourses,
  totalCounts,
  courseCounts,
  getTransactions,
  getApprovedCourses,
  getunApprovedCourses,
  getunApprovedTherapists,
  getApprovedTherapists,
  rejectCourse,
  rejectTherapist,
  logout,
  studentCourseCount,
  getReportedCompanions,
  approveCompanion,
  rejectCompanion,
  getApprovedCompanions,getunApprovedCompanions,getonholdCompanions,
  suspendCompanion
} = require("../controllers/admin");
const { adminAuthLeapify } = require("../middlewares/auth");

router.post("/login-admin", loginAdmin);
router.post("/reject-therapist/:id", adminAuthLeapify, rejectTherapist);
router.post("/reject-course/:id", adminAuthLeapify, rejectCourse);
router.post("/approve-therapist/:id", adminAuthLeapify, approveTherapist);
router.post("/approve-course/:id", adminAuthLeapify, approveCourse);
router.get("/get-therapists", adminAuthLeapify, getTherapists);
router.get(  "/get-unapproved-therapists",  adminAuthLeapify,  getunApprovedTherapists);
router.get("/get-approved-therapists", adminAuthLeapify, getApprovedTherapists);

router.get("/get-courses", adminAuthLeapify, getCourses);
router.get("/get-approved-courses", adminAuthLeapify, getApprovedCourses);
router.get("/get-unapproved-courses", adminAuthLeapify, getunApprovedCourses);
router.get("/total-counts", adminAuthLeapify, totalCounts);
router.get("/course-counts", adminAuthLeapify, courseCounts);
router.get("/student-course-count", adminAuthLeapify, studentCourseCount);
router.get("/get-transactions", adminAuthLeapify, getTransactions);

router.post('/approve-companion/:id',adminAuthLeapify,approveCompanion)
router.post('/reject-companion/:id',adminAuthLeapify,rejectCompanion)
router.post('/suspend-companion/:id',adminAuthLeapify,suspendCompanion)
router.get('/reported-companions',adminAuthLeapify,getReportedCompanions)
router.get('/approved-companions',adminAuthLeapify,getApprovedCompanions)
router.get('/unapproved-companions',adminAuthLeapify,getunApprovedCompanions)
router.get('/onhold-companions',adminAuthLeapify,getonholdCompanions)
router.post("/logout-admin", adminAuthLeapify, logout);

module.exports = router;
