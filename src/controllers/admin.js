const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const therapist = require("../models/therapists");
const course = require("../models/course");
const user = require("../models/user");
const admin = require("../models/admin");
const {
  paginatePayments,
  paginateTherapistAdmin,
  paginateStudentCourseCount,
  paginateCourseApproved,
  paginateCourseAdmin,
  paginateCourseunApproved,
  paginateTherapistunApproved,
  paginateTherapistApproved,
  paginateReportedCompanion,
  paginateCompanionApproved,paginateCompanionunApproved,paginateCompaniononhold
} = require("../utils/pagination");
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailValidation = await admin.findOne({ email });
    if (emailValidation != null) {
      const passwordValidation = await bcrypt.compare(
        password,
        emailValidation.password
      );
      if (passwordValidation == true) {
        // log the user in
        const token = jwt.sign(
          {
            id: emailValidation._id,
            email: emailValidation.email,
            username: emailValidation.username,
            name: emailValidation.name,
            user: "admin",
          },
          process.env.JWT_SECRET,
          { expiresIn: "15d" }
        );

        await admin.findOneAndUpdate(
          { username: emailValidation.username },
          {
            tokens: token,
          }
        );
        res.json({
          status: "ok",
          msg: "Logged in Successfully",
          token: token,
        });
      } else {
        res.json({ status: "error", msg: "incorrect password" });
      }
    } else {
      res.json({ status: "error", msg: "user doesnt exist" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getReportedCompanions=async(req,res)=>{
  try{
    const {page}=req.query
    const reported=await paginateReportedCompanion(page)
    if (reported.error) {
      res.json({ status: "ok", msg: reported.error });
    } else {
      res.json({ status: "ok", msg: reported });
    }
  }catch(e){
    console.log(e)
    return res.json({status:"error",msg:"an error occured"})
  }
}

exports.approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateCourse = await course
      .findByIdAndUpdate(id, {
        $set: { approved: true, onHold: false, notApproved: false },
      })
      .exec();
    if (!updateCourse) {
      res.json({ status: "error", msg: "Course does not exist" });
    } else {
      res.json({ status: "ok", msg: "Course approved" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.approveCompanion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateCourse = await user
      .findByIdAndUpdate(id, {
        $set: { approved: true, onHold: false, notApproved: false },
      })
      .exec();
    if (!updateCourse) {
      res.json({ status: "error", msg: "User does not exist" });
    } else {
      res.json({ status: "ok", msg: "User approved" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};


exports.rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateCourse = await course
      .findByIdAndUpdate(id, {
        $set: { approved: false, onHold: false, notApproved: true },
      })
      .exec();
    if (!updateCourse) {
      res.json({ status: "error", msg: "Course does not exist" });
    } else {
      res.json({ status: "ok", msg: "Course rejected" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.rejectCompanion= async (req, res) => {
  try {
    const { id } = req.params;
    const updateCourse = await user
      .findByIdAndUpdate(id, {
        $set: { approved: false, onHold: false, notApproved: true },
      })
      .exec();
    if (!updateCourse) {
      res.json({ status: "error", msg: "User does not exist" });
    } else {
      res.json({ status: "ok", msg: "User rejected" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};


exports.approveTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const updateTherapist = await therapist
      .findByIdAndUpdate(id, {
        $set: { approved: true, onHold: false, notApproved: false },
      })
      .exec();
    if (!updateTherapist) {
      res.json({ status: "error", msg: "Therapist does not exist" });
    } else {
      res.json({ status: "ok", msg: "Therapist approved" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.rejectTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const updateCourse = await therapist
      .findByIdAndUpdate(id, {
        $set: { approved: false, onHold: false, notApproved: true },
      })
      .exec();
    if (!updateCourse) {
      res.json({ status: "error", msg: "Therapist does not exist" });
    } else {
      res.json({ status: "ok", msg: "Therapist rejected" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.getTherapists = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateTherapistAdmin(page);

    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { page } = req.query;
    const courses = await paginateCourseAdmin(page, "onHold");

    if (courses.error) {
      res.json({ status: "ok", msg: courses.error });
    } else {
      res.json({ status: "ok", msg: courses });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.totalCounts = async (req, res) => {
  try {
    const lastWeek1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(Date.now());
    const fourteenDays = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    console.log(lastWeek1);

    const lastWeekCourses = await course
      .find({
        created_at: { $gt: fourteenDays, $lt: lastWeek1 },
      })
      .count()
      .exec();
    const thisWeekCourse = await course
      .find({
        created_at: { $gt: lastWeek1, $lt: today },
      })
      .count()
      .exec();
    let coursePercent =
      ((thisWeekCourse - lastWeekCourses) / lastWeekCourses) * 100;
    if (coursePercent == Infinity) {
      coursePercent = 0;
    }
    const totalTherapist = await therapist.find({}).count().exec();
    const lastWeekTherapist = await therapist
      .find({
        created_at: { $gt: fourteenDays, $lt: lastWeek1 },
      })
      .count()
      .exec();
    const thisWeekTherapist = await therapist
      .find({
        created_at: { $gt: lastWeek1, $lt: today },
      })
      .count()
      .exec();
    let therapistPercent =
      ((thisWeekTherapist - lastWeekTherapist) / lastWeekTherapist) * 100;
    if (therapistPercent == Infinity) {
      therapistPercent = 0;
    }

    const totalCourses = await course.find({}).count().exec();
    const lastWeekUser = await user
      .find({
        created_at: { $gt: fourteenDays, $lt: lastWeek1 },
      })
      .count()
      .exec();
    const thisWeekUser = await user
      .find({
        created_at: { $gt: lastWeek1, $lt: today },
      })
      .count()
      .exec();
    let userPercent = ((thisWeekUser - lastWeekUser) / lastWeekUser) * 100;
    if (userPercent == Infinity) {
      userPercent = 0;
    }
    const totalUsers = await user.find({}).count().exec();

    res.json({
      status: "ok",
      msg: {
        totalTherapist,
        totalCourses,
        totalUsers,
        userPercent,
        therapistPercent,
        coursePercent,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.courseCounts = async (req, res) => {
  try {
    const totalApproved = await course.find({ approved: true }).count().exec();
    const totalrejected = await course
      .find({ notApproved: true })
      .count()
      .exec();
    const totalOnhold = await course.find({ onHold: true }).count().exec();

    res.json({
      status: "ok",
      msg: { totalApproved, totalrejected, totalOnhold },
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginatePayments(page);

    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.studentCourseCount = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateStudentCourseCount(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.getApprovedCourses = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateCourseApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};
exports.logout = async (req, res) => {
  try {
    const admin = req.adminLeapify;
    console.log(admin.email);
    admin.findOneAndUpdate(
      { email: admin.email },
      { $set: { tokens: "", loggedIn: false } },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
      }
    );

    return res.json({ status: "ok", msg: "successfully logged out" });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error" });
  }
};

exports.getunApprovedCourses = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateCourseunApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.getunApprovedTherapists = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateTherapistunApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.suspendCompanion=async(req,res)=>{
  try {
    const { id } = req.params;
    const updateCourse = await user.findByIdAndUpdate(id, {
        $set: {blocked:true },
      }).exec();
    if (!updateCourse) {
      res.json({ status: "ok", msg: "Companion does not exist" });
    } else {
      res.json({ status: "ok", msg: "Companion suspended" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
}

exports.getonholdCompanions=async(req,res)=>{
  try {
    const { page } = req.query;
    const transactions = await paginateCompaniononhold(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
}

exports.getunApprovedCompanions=async(req,res)=>{
  try {
    const { page } = req.query;
    const transactions = await paginateCompanionunApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
}

exports.getApprovedTherapists = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateTherapistApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.getApprovedCompanions = async (req, res) => {
  try {
    const { page } = req.query;
    const transactions = await paginateCompanionApproved(page);
    if (transactions.error) {
      res.json({ status: "ok", msg: transactions.error });
    } else {
      res.json({ status: "ok", msg: transactions });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occurred" });
  }
};

exports.logout = async (req, res) => {
  try {
    const admin = req.adminLeapify;
    console.log(admin.email);
    admin.findOneAndUpdate(
      { email: admin.email },
      { $set: { tokens: "", loggedIn: false } },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
      }
    );

    return res.json({ status: "ok", msg: "successfully logged out" });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error" });
  }
};
