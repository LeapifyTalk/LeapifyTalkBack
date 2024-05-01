require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
const jwt = require("jsonwebtoken");
const ratings = require("../models/ratings");
const chatRoom = require("../models/chatRoom");
const mongoose = require("mongoose");
const sendmail = require("../utils/sendmail");
const companion = require("../models/companion");
const preference = require("../models/preference");
const User = require("../models/user");
const rating = require("../models/ratings");
const therapist = require("../models/therapists");
const ongoing = require("../models/ongoing");
const complete = require("../models/completed");
const purchased = require("../models/purchased");
const course = require("../models/course");
// =========================sign up==================

exports.signUpCompanion = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const courseID = "62af4c01c52b38aa49a35f86";
    const validateEmail = await User.findOne({ email }).exec();
    if (validateEmail) {
      res.json({ status: "error", msg: "Email ID already taken" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      let registerToken = crypto.randomBytes(64).toString("hex");
      const hashPassword = bcrypt.hash(password, salt).then(async (rec) => {
        const account = await User.create({
          name,
          username: nanoid(),
          email,
          password: rec,
          registerToken,
          role: "companion",
          companion_course: mongoose.Types.ObjectId(courseID),
          ready_for_quiz: false,
        });
      });
      const msg = {
        from: `Banao <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "Banao Verify Link",
        text: `
            Hello  , your request for reactivation is confirmed
            please click on the link to verify your email
            ${process.env.CLIENT_URI}/verify-reset-password/${registerToken}
            `,
        html: `
            hello, your request for reactivation is confirmed
            please click on the link to verify your email
            <a href="http://localhost:5000/api/companion/verify-email/${registerToken}">Verify Email</a>
            `,
      };
      // sendmail(msg);
      res.json({
        status: "ok",
        msg: "Check you email to confirm registration",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

exports.signUpTherapist = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validateEmail = await User.findOne({ email }).exec();
    if (validateEmail) {
      res.json({ status: "error", msg: "Email ID already taken" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      let registerToken = crypto.randomBytes(64).toString("hex");
      const hashPassword = bcrypt.hash(password, salt).then(async (rec) => {
        const account = await User.create({
          name,
          username: nanoid(),
          email,
          password: rec,
          registerToken,
          role: "therapist",
        });
      });
      const msg = {
        from: `Banao <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "Banao Verify Link",
        text: `
            Hello  , your request for reactivation is confirmed
            please click on the link to verify your email
            ${process.env.CLIENT_URI}/verify-reset-password/${registerToken}
            `,
        html: `
            hello, your request for reactivation is confirmed
            please click on the link to verify your email
            <a href="http://localhost:5000/api/companion/verify-email/${registerToken}">Verify Email</a>
            `,
      };
      // sendmail(msg);
      res.json({
        status: "ok",
        msg: "Check you email to confirm registration",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

exports.signUpDoctor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validateEmail = await User.findOne({ email }).exec();
    if (validateEmail) {
      res.json({ status: "error", msg: "Email ID already taken" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      let registerToken = crypto.randomBytes(64).toString("hex");
      const hashPassword = bcrypt.hash(password, salt).then(async (rec) => {
        const account = await User.create({
          name,
          username: nanoid(),
          email,
          password: rec,
          registerToken,
          role: "cousrsecreator",
        });
      });
      const msg = {
        from: `Banao <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "Banao Verify Link",
        text: `
            Hello  , your request for reactivation is confirmed
            please click on the link to verify your email
            ${process.env.CLIENT_URI}/verify-reset-password/${registerToken}
            `,
        html: `
            hello, your request for reactivation is confirmed
            please click on the link to verify your email
            <a href="http://localhost:5000/api/companion/verify-email/${registerToken}">Verify Email</a>
            `,
      };
      // sendmail(msg);
      res.json({
        status: "ok",
        msg: "Check you email to confirm registration",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

exports.signUpUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const validateEmail = await User.findOne({ email }).exec();
    if (validateEmail) {
      res.json({ status: "error", msg: "Email ID already taken" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      let registerToken = crypto.randomBytes(64).toString("hex");
      const hashPassword = bcrypt.hash(password, salt).then(async (rec) => {
        const account = await User.create({
          name,
          username: nanoid(),
          email,
          password: rec,
          registerToken,
          role: "user",
        });
      });
      const msg = {
        from: `Banao <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: "Banao Verify Link",
        text: `
            Hello  , your request for reactivation is confirmed
            please click on the link to verify your email
            ${process.env.CLIENT_URI}/verify-reset-password/${registerToken}
            `,
        html: `
            hello, your request for reactivation is confirmed
            please click on the link to verify your email
            <a href="http://localhost:5000/api/companion/verify-email/${registerToken}">Verify Email</a>
            `,
      };
      // sendmail(msg);
      res.json({
        status: "ok",
        msg: "Check you email to confirm registration",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

// =========================sign up=========================

// ==========================verify email===============

exports.verifyMail = async (req, res) => {
  const { token } = req.params;
  // console.log(token);
  try {
    const updatedUser = await User.findOneAndUpdate(
      { registerToken: token },
      { $set: { registerToken: null, isVerified: true } }
    );
    // console.log(updatedUser);
    if (!updatedUser) {
      return res.json({
        status: "error",
        msg: "email token is invalid or expired",
      });
    }
    // return res.redirect(`${process.env.CLIENT_URI}/login`)
    return res.json({ status: "ok", msg: "Email verified Successfully" });
  } catch (error) {
    console.log(error);
    // return res.redirect(`${process.env.CLIENT_URI}/login`)
    return res.json({ status: "error", msg: error });
  }
};
//=================== Verify mail ===========================================

// =========================forgot password==================

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      status: "error",
      msg: "No user with this email",
    });
  }
  let token = crypto.randomBytes(64).toString("hex");
  user.resetPasswordToken = token;
  await user.save();

  try {
    const msg = {
      from: `Banao <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Reset password link",
      text: `
            hello, your request for reactivation is confirmed
            please click on the link to reset your passwrod
            ${process.env.URI}/forgot-password/${token}
            `,
      html: `
            hello, your request for reactivation is confirmed
            please click on the link to reset your passwrod
            <a href="${process.env.URI}/api/companion/forgot-password/${token}"> reset password </a>
            `,
    };
    sendmail(msg);

    return res.json({
      status: "ok",
      msg: "check your email for further information",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      msg: "Some thing went wrong, contact us for assistance",
    });
  }
};

exports.postRating = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  const findToken = await User.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  let companionID = req.params.id;
  const { rates } = req.body;
  try {
    const putRating = await rating.create({ userID, companionID, rates });
    return res.json({ status: "ok", msg: "rating posted" });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.postReview = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  const findToken = await User.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  const companionID = req.params.id;
  const { report } = req.body;
  try {
    const putReview = await rating.create({
      userID,
      companionID,
      review: report,
      reported: true,
    });
    return res.json({ status: "ok", msg: "companon reported" });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

// =========================forgot password========================

// ===================forgot password verify======================

exports.forgotPasswordVerify = async (req, res) => {
  const { token } = req.params;
  try {
    let user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.json({
        status: "error",
        msg: "Token is invalid or expired",
      });
    }
    await User.findOneAndUpdate(
      { resetPasswordToken: token },
      { $set: { verifiedForPasswordReset: true } }
    );
    // redirect to reset password page
    return res.json({
      status: "ok",
      msg: "verified",
      emailToken: token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      msg: "Token is invalid or expired",
    });
  }
};
//=================== Forgot Password Verfiy ===========================================

//=================== Reset Password ===========================================
exports.resetPassword = async (req, res) => {
  const { new_password, confirm_password, token } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.json({
        status: "error",
        msg: "Invalid token or token is expired",
      });
    }
    // if (!user.verifiedForPasswordReset) {
    //   return res.json({
    //     status: "error",
    //     msg: "You have no permissions",
    //   });
    // }
    if (token !== user.resetPasswordToken || user.resetPasswordToken === null) {
      return res.json({
        status: "error",
        msg: "token is not valid or expired",
      });
    }

    if (new_password !== confirm_password) {
      res.json({ status: "error", msg: "password does not match" });
    }
    const password = await bcrypt.hash(new_password, 10);
    await companion.findOneAndUpdate(
      { emailToken: token },
      { $set: { password: password, emailToken: null } }
    );
    return res.json({
      status: "ok",
      msg: "password changed successfullly",
    });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error", msg: "something went wrong" });
  }
};
//=================== Reset Psssword ===========================================

//=================== Login ===========================================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  const user = await User.findOne({ email }).lean();
  if (!user) {
    return res.json({
      status: "error",
      msg: "User Not Found",
    });
  }
  // console.log(user);
  if (!(await bcrypt.compare(password, user.password))) {
    return res.json({
      status: "error",
      msg: "Invalid email or password",
    });
  }

  if (!user.isVerified) {
    return res.json({
      status: "error",
      msg: "Please verify Your Email",
    });
  }
  // if(user.notApproved==true  && (user.role=='companion' || user.role=='therapist')){
  //   return res.json({status:"ok",msg:"you were rejected by the admin"})
  // }
  // if(user.onHold==true && (user.role=='companion' || user.role=='therapist')){
  //   return res.json({status:"ok",msg:"you are not yet approved by the admin"})
  // }
  // if(user.approved==true && (user.role=='companion' || user.role=='therapist')){
  if (user.isVerified) {
    try {
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          isPreferenceAdded: user.isPreferenceAdded,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
      );

      await User.findOneAndUpdate(
        { email },
        {
          tokens: token,
        }
      );
      return res.json({
        status: "ok",
        msg: "Logged in Successfully",
        token: token,
      });
    } catch (error) {
      console.log(error);
      return res.json({
        status: "error",
        msg: "something went wrong",
      });
    }
  }
};
//=================== Login ===========================================

// ==================Dashboard=======================

exports.companionHome = async (req, res) => {
  const courseID = "CompanionHome - 65a25b2024647b12b0c5a282";
  // console.log(courseID);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // console.log("token",token);
  const findToken = await User.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  const instructorCourseAll = await course
    .findById(findToken.companion_course, { approved: 0 })
    .populate(["instructor", "ratings", "sections"])
    .exec();
  // console.log(instructorCourseAll?.sections);
  // console.log("instructorCourseAll", instructorCourseAll);
  try {
    const findComplete = await complete
      .findOne({ userID })
      .populate("courseID")
      .exec();
    const findOngoing = await ongoing
      .findOne({ userID })
      .populate("courseID")
      .exec();
    if (!findOngoing && !findComplete) {
      // instructorCourseAll.forEach((course) => {
      //   let comp = {};
      //   let toPush = {};
      let instructorCourse = [];
      let instCourse = {};
      try {
        let sum = 0;
        instructorCourseAll.ratings.forEach((rate) => {
          sum += rate.rates;
        });
        avgRate = sum / instructorCourseAll.ratings.length;
        instCourse.rates = avgRate;
      } catch (e) {
        // let instCourse = {};
        instCourse.rates = 0;
      }
      // console.log(avgRate);
      let newObj = {
        _id: instructorCourseAll._id,

        instructor: instructorCourseAll.instructor.name,
        category: instructorCourseAll.category,
        sections: instructorCourseAll.sections,
        course_title: instructorCourseAll.course_title,
        video: instructorCourseAll.video,
        sections: instructorCourseAll.sections[0],
        photo: instructorCourseAll.photo,
        progress: 0,
        offer_price: instructorCourseAll.offer_price,
        original_price: instructorCourseAll.original_price,
        tags: instructorCourseAll.tags,
        language: instructorCourseAll.language,
        rates: instCourse.rates,
        last_updated: instructorCourseAll.last_updated,
        what_youll_learn: instructorCourseAll.what_youll_learn,
        sub_heading: instructorCourseAll.sub_heading,
        description: instructorCourseAll.description,
      };
      newObj.sections = instructorCourseAll.sections;
      // instructorCourse.push(newObj);
      // console.log(newObj.sections);
      return res.json({
        status: "ok",
        // first: { instructorCourse: instructorCourse[0] },
        course: newObj,
        testAvailable: false,
      });
    } else if (findOngoing) {
      const theCourses = await ongoing
        .find({ userID })
        .populate("courseID")
        .populate("sections")
        .exec();
      //     // res.json({ theCourses });
      let finalArray = [];
      for (const oneCourse of theCourses) {
        // const instructor = await therapist
        //   .findOne({ _id: oneCourse.courseID.instructor }, { name: 1 })
        //   .exec();
        let instCourse = {};
        try {
          let sum = 0;
          instructorCourseAll.ratings.forEach((rate) => {
            sum += rate.rates;
          });
          avgRate = sum / instructorCourseAll.ratings.length;
          instCourse.rates = avgRate;
        } catch (e1) {
          // let instCourse = {};
          console.log(e1);
          instCourse.rates = 0;
        }
        // const ratings = await rating
        //   .findOne({ courseID: oneCourse.courseID, userID })
        //   .exec();

        // const courses = await course.findOne({ _id: oneCourse.courseID });
        // oneArray.ratings = ratings;
        let oneArray = {};
        let newObj = {
          _id: oneCourse.courseID._id,
          instructor: instructorCourseAll.instructor.name,
          category: oneCourse.courseID.category,
          sections: instructorCourseAll.sections,
          course_title: oneCourse.courseID.course_title,
          video: oneCourse.courseID.video,
          photo: oneCourse.courseID.photo,
          offer_price: oneCourse.courseID.offer_price,
          original_price: oneCourse.courseID.original_price,
          // sections: oneCourse.sectionID,
          progress: oneCourse.progress,
          doneSections: oneCourse.sections,
          tags: oneCourse.courseID.tags,
          language: oneCourse.courseID.language,
          rates: instCourse.rates,
          last_updated: oneCourse.courseID.last_updated,
          what_youll_learn: oneCourse.courseID.what_youll_learn,
          sub_heading: oneCourse.courseID.sub_heading,
          description: oneCourse.courseID.description,
        };
        // console.log("done ", oneCourse.courseID);
        // oneArray.courses = newObj;
        // finalArray.push(newObj);
        return res.json({
          status: "ok",
          course: newObj,
          testAvailable: false,
        });
      }
    } else if (findComplete) {
      let instCourse = {};
      try {
        let sum = 0;
        instructorCourseAll.ratings.forEach((rate) => {
          sum += rate.rates;
        });
        avgRate = sum / instructorCourseAll.ratings.length;
        instCourse.rates = avgRate;
      } catch (e1) {
        // let instCourse = {};
        console.log(e1);
        instCourse.rates = 0;
      }
      let newObj = {
        _id: instructorCourseAll._id,
        instructor: instructorCourseAll.instructor.name,
        category: instructorCourseAll.category,
        sections: instructorCourseAll.sections,
        course_title: instructorCourseAll.course_title,
        video: instructorCourseAll.video,
        photo: instructorCourseAll.photo,
        offer_price: instructorCourseAll.offer_price,
        original_price: instructorCourseAll.original_price,
        // sections: oneCourse.sectionID,
        progress: 100,
        tags: instructorCourseAll.tags,
        language: instructorCourseAll.language,
        rates: instCourse.rates,
        last_updated: instructorCourseAll.last_updated,
        what_youll_learn: instructorCourseAll.what_youll_learn,
        sub_heading: instructorCourseAll.sub_heading,
        description: instructorCourseAll.description,
      };
      return res.json({
        status: "ok",
        course: newObj,
        testAvailable: true,
      });
    }
    // else if (!findOngoing && findPurchased && !findComplete) {
    //     const instructorCourseAll = await course
    //       .findById(courseID, { approved: 0 })
    //       .populate(["instructor", "ratings", "sections"])
    //       .exec();
    //     // instructorCourseAll.forEach((course) => {
    //     //   let comp = {};
    //     let sum = 0;
    //     //   let toPush = {};
    //     let instructorCourse = [];
    //     instructorCourseAll.ratings.forEach((rate) => {
    //       sum += rate.rates;
    //     });
    //     avgRate = sum / instructorCourseAll.ratings.length;
    //     console.log(avgRate);
    //     instructorCourseAll.rates = avgRate;
    //     let newObj = {
    //       _id: instructorCourseAll._id,
    //       instructor: instructorCourseAll.instructor,
    //       category: instructorCourseAll.category,
    //       course_title: instructorCourseAll.course_title,
    //       video: instructorCourseAll.video,
    //       sections: instructorCourseAll.sections,
    //       photo: instructorCourseAll.photo,
    //       offer_price: instructorCourseAll.offer_price,
    //       original_price: instructorCourseAll.original_price,
    //       tags: instructorCourseAll.tags,
    //       language: instructorCourseAll.language,
    //       rates: instructorCourseAll.rates,
    //       last_updated: instructorCourseAll.last_updated,
    //       what_youll_learn: instructorCourseAll.what_youll_learn,
    //       ratings: instructorCourseAll.ratings,
    //       sub_heading: instructorCourseAll.sub_heading,
    //       description: instructorCourseAll.description,
    //     };

    //     instructorCourse.push(newObj);

    //     return res.json({
    //       status: "ok",
    //       third: { instructorCourse: instructorCourse[0] },
    //     });
    //   }
    //   // completed course
    //   else if (findComplete) {
    //     const myCourses = await complete.find({ userID }).exec();
    //     let courseArray = myCourses[0].courseID;
    //     let finalArray = [];
    //     courseArray.forEach(async (one) => {
    //       let oneArray = {};
    //       let ratings = await rating.findOne({ userID, courseID: one }).exec();
    //       let courses = await course
    //         .findOne({ _id: one })
    //         .populate("instructor", "name")
    //         .exec();
    //       // console.log(courses);
    //       oneArray.ratings = ratings;
    //       oneArray.courses = courses;
    //       finalArray.push(oneArray);
    //       if (finalArray.length == myCourses.length) {
    //         return res.json({
    //           status: "ok",
    //           test_send: finalArray,
    //           test: "test sent",
    //         });
    //       }
    //     });
    //   }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

// ==================Dashboard=======================

// ==================Edit Companion===============

exports.editCompanion = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await User.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    // console.log(decoded);
    const _id = decoded.payload.id;
    const { name, email, phone, about } = req.body;
    const validateEmail = await User.findOne({
      email: email,
      _id: { $ne: _id },
    }).exec();
    const validatePhone = await User.findOne({
      phone: phone,
      _id: { $ne: _id },
    }).exec();
    if (validatePhone) {
      return res.json({ status: "error", msg: "Phone Number already taken" });
    }
    if (validateEmail) {
      return res.json({ status: "error", msg: "Email ID already taken" });
    }
    if (findToken.role != "companion") {
      return res.json({ status: "error", msg: "Not a companion" });
    }
    if (req.file) {
      // const photo = req.file.location;
      const photo = req.file.filename;
      const editDetails = await User.findByIdAndUpdate(_id, {
        $set: {
          name,
          email,
          aboutMe: about,
          phone,
          photo,
        },
      }).exec();
      res.json({ status: "ok", msg: "added with photo" });
    } else {
      const editDetails = await User.findByIdAndUpdate(_id, {
        $set: {
          name,
          email,
          phone,
          aboutMe: about,
        },
      }).exec();
      res.json({ status: "ok", msg: "added without photo" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

// =================One companion===========
exports.getOneCompanion = async (req, res) => {
  try {
    const companionID = req.params.id;
    const qnID = "624de71802fe32307ca8f22e";
    const reviews = await ratings
      .find({ companionID, rates: { $ne: null } })
      .exec();
    let sum = 0;
    reviews.forEach((row) => {
      sum += row.rates;
    });
    const avgRate = sum / reviews.length;
    const companion = await User.findOne({ _id: companionID }).exec();
    const languages = await preference
      .findOne({
        userID: companionID,
        questionID: qnID,
      })
      .exec();
    let activeNow = "";
    if (companion.tokens == "") {
      activeNow = "active";
    } else {
      activeNow = companion.lastSeen;
    }
    const privateChats = await chatRoom
      .find({ userIds: companionID, isPrivate: true })
      .count()
      .exec();
    return res.json({
      status: "ok",
      rating: avgRate,
      aboutMe: companion.aboutMe,
      totalRatings: reviews.length,
      name: companion.name,
      lastSeen: activeNow,
      languages: languages.answer,
      privateChats,
      photo: companion.photo,
      gender: companion.gender,
      listenerSince: companion.created_at,
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

// ================Send companions=================

exports.getCompanions = async (req, res) => {
  try {
    const allCompanion = await User.find(
      { role: "companion" },
      { password: 0 }
    ).exec();

    res.json({ status: "ok", allCompanion });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "am error occured" });
  }
};

//=================== Logout ===========================================
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await User.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const userID = decoded.payload.id;
    const x = await User.findOneAndUpdate(
      { email: decoded.payload.email },
      { $set: { tokens: "", lastSeen: Date.now() } }
    ).exec();
    return res.json({ status: "ok", msg: "successfully logged out" });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error" });
  }
};
//=================== Logout ===========================================
