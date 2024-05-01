require("dotenv").config();
const purchased = require("../models/purchased");
// const therapist = require("../models/therapists");
const therapist = require("../models/user");
const User = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const upload = require("../utils/s3");
const { decodeToken } = require("../middlewares/auth");
const {
  paginationById,
  paginateCourses,
  paginateDashboard,
} = require("../utils/pagination");
const crypto = require("crypto");
const sendmail = require("../utils/sendmail");
const { customAlphabet } = require("nanoid");
const { truncateSync } = require("fs");
const course = require("../models/course");
const nanoid = customAlphabet("1234567890", 4);
const nanoid_uname = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.createTherapist = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const validateEmail = await therapist.findOne({ email }).exec();
    if (validateEmail) {
      res.json({ status: "error", msg: "Email ID already taken" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      let registerToken = crypto.randomBytes(64).toString("hex");
      const hashPassword = bcrypt.hash(password, salt).then(async (rec) => {
        const account = await therapist.create({
          name,
          username: nanoid_uname(),
          email,
          password: rec,
          registerToken,
          role: "therapist",
        });
        let x = account.name;
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
            <a href="http://localhost:5000/api/therapist/verify-email/${registerToken}">Verify Email</a>
            `,
      };
      sendmail(msg);
      res.json({ status: "ok", msg: "Registered" });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    let user = await therapist.findOne({ registerToken: token });
    if (!user) {
      return res.json({
        status: "error",
        msg: "Token is invalid or expired",
      });
    }
    await therapist.findOneAndUpdate(
      { registerToken: token },
      { $set: { verifiedUser: true } }
    );
    return res.json({
      status: "ok",
      msg: "Email verified, now you can login",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      msg: "Token is invalid or expired",
    });
  }
};

exports.loginTherapist = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailValidation = await therapist.findOne({ email });
    if (emailValidation != null) {
      if (!emailValidation.verifiedUser) {
        res.json({ status: "error", msg: "Please Verify your Email" });
      } else {
        if (emailValidation.approved == false) {
          res.json({
            status: "error",
            msg: "You aren't approved by the admin",
          });
        } else {
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
                name: emailValidation.name,
                role: emailValidation.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );
            res.json({ status: "ok", msg: "logged in", token });

            await therapist.findOneAndUpdate(
              { email },
              {
                tokens: token,
              }
            );
          } else {
            res.json({ status: "error", msg: "incorrect password" });
          }
        }
      }
    } else {
      res.json({ status: "error", msg: "user doesnt exist" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    let { phone, name } = req.body;

    const otp = nanoid();
    const newPhone = "+91" + phone;
    const timeOtpSent = Date.now();
    const phoneValidation = await therapist.findOne({ phone }).exec();
    if (phoneValidation) {
      res.json({ status: "error", msg: "Phone number already taken" });
    } else {
      console.log(newPhone);
      const record = await therapist.create({
        name,
        phone,
        timeOtpSent,
        otp,
      });
      client.messages
        .create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: newPhone,
          body: `Your register otp for LeapifyTalk app is ${otp}. It is valid for 5 minutes`,
        })
        .then((message) => {
          res.json({ status: "ok", msg: "otp sent", message });
        })
        .catch((e) => res.json(e));
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occurred" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const newPhone = "+91" + phone;
    const currentTime = Date.now();
    const therapistVal = await therapist.findOne({ phone }).exec();

    const earlierOtp = therapistVal.timeOtpSent;
    console.log(currentTime - earlierOtp);
    if (currentTime - earlierOtp <= 60000) {
      res.json({
        status: "error",
        msg: "You can make a new request after 60 seconds",
      });
    } else {
      const timeOtpSent = Date.now();
      const otp = nanoid();
      const updateResend = await therapist
        .findOneAndUpdate({ phone }, { $set: { otp, timeOtpSent } })
        .exec();
      client.messages
        .create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: newPhone,
          body: `Your new otp for LeapifyTalk app is ${otp}. It is valid for 5 minutes`,
        })
        .then((message) => {
          res.json({ status: "ok", msg: "otp sent", message });
        })
        .catch((e) => res.json(e));
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const newPhone = "+91" + phone;
    const fiveMins = 60 * 1000;
    const currentDate = Date.now();
    const otpVerify = await therapist.find({ otp, phone }).exec();
    if (otpVerify.length == 0) {
      res.json({ msg: "Wrong otp" });
    } else if (
      Number(fiveMins) >
      Number(currentDate) - Number(otpVerify[0].timeOtpSent)
    ) {
      const updateRegiter = await therapist
        .findOneAndUpdate({ otp }, { $set: { registered: true } })
        .exec();
      res.json({ status: "ok", msg: "registered" });
    } else {
      const deleteQuery = await therapist
        .findOneAndDelete({ phone, otp })
        .exec();
      if (deleteQuery) {
        res.json({
          status: "error",
          msg: "otp expired,register again",
          deleteQuery,
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occured" });
  }
};

exports.loginByOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const newPhone = "+91" + phone;
    const findPhone = await therapist
      .findOne({ phone, registerd: true })
      .exec();
    if (!findPhone) {
      res.json({ status: "error", msg: "number doesnt exist,please register" });
    } else {
      const loginOtp = nanoid();
      const timeLoginOtpSent = Date.now();

      const record = await therapist
        .findOneAndUpdate(
          {
            phone,
          },
          { $set: { loginOtp, timeLoginOtpSent } }
        )
        .exec();
      client.messages
        .create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: newPhone,
          body: `Your login otp for LeapifyTalk app is<a>${loginOtp}</a>. It is valid for 5 minutes`,
        })
        .then((message) => {
          res.json({
            status: "ok",
            msg: "OTP sent",
          });
        })
        .catch((e) => res.json(e));
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const newPhone = "+91" + phone;
    const currentTime = Date.now();
    const therapistVal = await therapist.findOne({ phone }).exec();

    const earlierOtp = therapistVal.timeOtpSent;
    console.log(earlierOtp);

    // const date = earlierOtp.toISOString();
    // res.json({ date });

    console.log(Number(currentTime) - Number(earlierOtp));
    if (currentTime - earlierOtp <= 60000) {
      res.json({
        status: "error",
        msg: "You can make a new request after 60 seconds",
      });
    } else {
      const timeOtpSent = Date.now();
      const loginOtp = nanoid();
      const updateResend = await therapist
        .findOneAndUpdate({ phone }, { $set: { otp: loginOtp, timeOtpSent } })
        .exec();
      client.messages
        .create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: newPhone,
          body: `Your new  login otp for LeapifyTalk app is ${loginOtp}. It is valid for 5 minutes`,
        })
        .then((message) => {
          res.json({ status: "ok", msg: "otp sent", message });
        })
        .catch((e) => res.json(e));
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An error occured" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const newPhone = "+91" + phone;
    const fiveMins = 300000;
    const currentDate = Date.now();
    const otpVerify = await therapist.findOne({ phone, loginOtp: otp }).exec();
    if (!otpVerify) {
      res.json({ msg: "Wrong otp" });
    }

    // console.log(Number(currentDate) - Number(otpVerify.timeLoginOtpSent));
    if (
      Number(fiveMins) >
      Number(currentDate) - Number(otpVerify.timeLoginOtpSent)
    ) {
      const token = jwt.sign(
        {
          id: otpVerify._id,
          phone: otpVerify.phone,
          name: otpVerify.name,
          user: "therapist",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
      );
      // const updateLogin = await therapist
      //   .findOneAndUpdate({ loginOtp: otp }, { $set: { loggedIn: true } })
      // .exec();
      await therapist.findOneAndUpdate(
        { phone },
        {
          $set: {
            tokens: token,
            loggedIn: true,
          },
        }
      );
      res.json({ status: "ok", msg: "logged in", token, user: "therapist" });
    } else {
      res.json({ status: "error", msg: "too late,try again" });
    }
  } catch (e) {
    console.log(e);
    res.json({ e });
  }
};

exports.forgotPasswordTherapist = async (req, res) => {
  const { email } = req.body;

  const mailTherapist = await therapist.findOne({ email });
  if (!mailTherapist) {
    return res.json({
      status: "error",
      msg: "No therapist with this email",
    });
  }
  let token = crypto.randomBytes(64).toString("hex");
  mailTherapist.emailToken = token;
  await mailTherapist.save();
  console.log(process.env);
  try {
    const msg = {
      from: `Banao <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Reset password link",
      text: `
            hello ${mailTherapist.name}, your request for reactivation is confirmed
            please click on the link to reset your passwrod
            https://leapifytalk.netlify.app/therapist/reset-password/${token}
            `,
      html: `
            hello, your request for reactivation is confirmed
            please click on the link to verify your reset passwrod
            <a href="https://leapifytalk.netlify.app/therapist/reset-password/${token}"> reset password </a>
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

// exports.verifyresetPasswordTherapist = async (req, res) => {
//   const { token } = req.params;
//   try {
//     let user = await therapist.findOne({ emailToken: token });
//     if (!user) {
//       return res.json({
//         status: "error",
//         msg: "Token is invalid or expired",
//       });
//     }
//     await therapist.findOneAndUpdate(
//       { emailToken: token },
//       { $set: { verifiedForPasswordReset: true } }
//     );
//     return res.json({
//       status: "ok",
//       msg: "verified",
//       emailToken: token,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       status: "error",
//       msg: "Token is invalid or expired",
//     });
//   }
// };

exports.resetPassword = async (req, res) => {
  const { new_password, confirm_password } = req.body;
  const { token } = req.params;
  try {
    const user = await therapist.findOne({ emailToken: token });
    if (!user) {
      return res.json({
        status: "error",
        msg: "Invalid token or token is expired",
      });
    }

    if (token !== user.emailToken || user.emailToken === null) {
      return res.json({
        status: "error",
        msg: "token is not valid or expired",
      });
    }

    if (new_password !== confirm_password) {
      res.json({ status: "error", msg: "password does not match" });
    } else {
      const password = await bcrypt.hash(new_password, 10);
      await therapist.findOneAndUpdate(
        { emailToken: token },
        { $set: { password: password, emailToken: null } }
      );
      return res.json({
        status: "ok",
        msg: "password changed successfullly",
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({ status: "error", msg: "something went wrong" });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { page } = req.query;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await therapist.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const instructorID = decoded.payload.id;

    const courses = await paginateDashboard(page, instructorID);
    // const totalUsers = await purchased
    //   .aggregate([
    //     {
    //       $match: {
    //         instructorID: mongoose.Types.ObjectId(instructorID),
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: null,
    //         count: { $sum: 1 },
    //       },
    //     },
    //   ])
    //   .exec();

    if (courses.error) {
      res.json({ status: "error", msg: courses.error });
    } else {
      res.json({
        status: "ok",
        msg: {
          len: courses.courses.length,
          courses,
        },
      });
    }

    // const findStudents = await therapist
    //   .findOne({ _id: instructor }, { students: 1, courses: 1 })
    //   .exec();
    // console.log("find ", findStudents);
    // var ones = [];
    // for (const student of findStudents.students) {
    //   const studentCourses = await user
    //     .findOne({ _id: student })
    //     .populate("courses");
    //   console.log("stu ", student);
    //   for (const each of studentCourses.courses) {
    //     console.log("cou", each);
    //     const sameCourses = await course
    //       .findOne(
    //         { instructor },
    //         { students: { $elemMatch: { $eq: student } } }
    //       )
    //       .populate("students")
    //       .exec();
    //     console.log(each + " " + " " + student + sameCourses.students);
    //     if (sameCourses.students.length != 0) {
    //       ones.push(sameCourses);
    //     }
    //   }
    // }
    // console.log(ones.length);
    // res.json({ status: "ok", ones });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error Occured" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const findToken = await therapist.findOne({ tokens: token }).exec();
    const decoded = jwt.decode(findToken.tokens, { complete: true });
    const instructorID = decoded.payload.id;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const today = new Date(new Date());

    const beforeLastMonth = new Date();
    beforeLastMonth.setMonth(beforeLastMonth.getMonth() - 2);
    console.log("beforeLastMonth", beforeLastMonth);

    const usersInLastMonth = await purchased
      .aggregate([
        // {
        //   $project: { userID: 1 },
        // },
        {
          $match: {
            createdAt: { $gt: lastMonth, $lte: today },
            instructorID: mongoose.Types.ObjectId(instructorID),
          },
        },
        {
          $group: {
            _id: { userID: "$userID" },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    let oneMonthUserID = [];
    for (const oneID of usersInLastMonth) {
      oneMonthUserID.push(oneID._id.userID);
    }

    const usersInLastTwoMonths = await purchased
      .aggregate([
        {
          $match: {
            createdAt: { $gt: beforeLastMonth, $lte: lastMonth },
            instructorID: mongoose.Types.ObjectId(instructorID),
          },
        },
        {
          $group: {
            _id: { userID: "$userID" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            userID: 1,
          },
        },
      ])
      .exec();

    let twoMonthUserID = [];
    for (const oneID of usersInLastTwoMonths) {
      twoMonthUserID.push(oneID._id.userID);
    }

    oneMonthUserID = oneMonthUserID.filter(
      (val) => !twoMonthUserID.includes(val)
    );

    let countOfThisMonth;
    if (oneMonthUserID.length == 0) {
      countOfThisMonth = 0;
    } else {
      countOfThisMonth = oneMonthUserID.length;
    }
    let countOfLastMonth;
    if (twoMonthUserID.length == 0) {
      countOfLastMonth = 0;
    } else {
      countOfLastMonth = twoMonthUserID.length;
    }

    const percentUsersInOneMonth =
      ((countOfThisMonth - countOfLastMonth) / countOfLastMonth) * 100;
    let finalPercentInUsers;
    if (percentUsersInOneMonth == Infinity) {
      finalPercentInUsers = 0;
    } else {
      finalPercentInUsers = percentUsersInOneMonth;
    }
    const pricingInLastMonth = await purchased
      .aggregate([
        {
          $match: {
            createdAt: { $gt: lastMonth, $lte: today },
            instructorID: mongoose.Types.ObjectId(instructorID),
          },
        },
        {
          $group: {
            _id: null,
            SUM: {
              $sum: "$price",
            },
            COUNT: {
              $sum: 1,
            },
          },
        },
      ])
      .exec();

    const pricingInLastTwoMonth = await purchased.aggregate([
      {
        $match: {
          createdAt: { $gt: beforeLastMonth, $lte: lastMonth },
          instructorID: mongoose.Types.ObjectId(instructorID),
        },
      },
      {
        $group: {
          _id: null,
          SUM: {
            $sum: "$price",
          },
          COUNT: {
            $sum: 1,
          },
        },
      },
    ]);

    let revenueInLastMonth;
    if (pricingInLastMonth.length == 0) {
      revenueInLastMonth = 0;
    } else {
      revenueInLastMonth = pricingInLastMonth[0].SUM;
    }
    let revenueInLastTwoMonths;
    if (pricingInLastTwoMonth.length == 0) {
      revenueInLastTwoMonths = 0;
    } else {
      revenueInLastTwoMonths = pricingInLastTwoMonth[0].SUM;
    }

    const totalUsers = await purchased
      .aggregate([
        {
          $match: {
            instructorID: mongoose.Types.ObjectId(instructorID),
          },
        },
        {
          $group: {
            _id: { userID: "$userID" },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    // pricingInLastTwoMonth;
    console.log("revenueInLastTwoMonths", revenueInLastTwoMonths);
    const revenuePercent =
      ((revenueInLastMonth - revenueInLastTwoMonths) / revenueInLastTwoMonths) *
      100;
    console.log("revenuePercent", revenuePercent);
    let finalPercentInRevenue = 0;
    if (revenuePercent == Infinity) {
      finalPercentInRevenue = 0;
    } else {
      finalPercentInRevenue = revenuePercent;
    }

    const totalUsersTillLastMonth = await purchased
      .aggregate([
        {
          $match: {
            createdAt: {
              $gt: new Date("2021-01-01T23:54:38.673Z"),
              $lte: lastMonth,
            },
            instructorID: mongoose.Types.ObjectId(instructorID),
          },
        },
        {
          $group: {
            _id: { userID: "$userID" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            userID: 1,
          },
        },
      ])
      .exec();

    const usersTillLastMonth = totalUsersTillLastMonth.length;
    const allUserLength = totalUsers.length;
    const percentIncreaseInUsers =
      ((allUserLength - usersTillLastMonth) / allUserLength) * 100;
    let finalPercentIncreaseTotUsers;
    if (percentIncreaseInUsers == Infinity) {
      finalPercentIncreaseTotUsers = 0;
    } else {
      finalPercentIncreaseTotUsers = percentIncreaseInUsers;
    }
    res.json({
      finalPercentInRevenue,
      revenueInLastMonth,
      countOfThisMonth,
      finalPercentInUsers,
      allUserLength,
      finalPercentIncreaseTotUsers,
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.myCourses = async (req, res) => {
  // token from front-end
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { page } = req.query;
  const findToken = await therapist.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const instructor = decoded.payload.id;
  const name = decoded.payload.name;
  const courses = await paginationById(therapist, page, instructor);
  if (courses.error) {
    res.json({ status: "error", error: courses.error });
  } else {
    // complete={}
    // complete.course=course
    // complete.rates=rates

    // allCousres.push(complete)

    // console.log("from main", courses.instructor1[0].rates);
    res.json({ status: "ok", response: { courses } });
  }
};

exports.instCourses = async (req, res) => {
  try {
    const { page } = req.query;
    const { id } = req.params;
    const findMyCourses = await therapist
      .find({ _id: id }, { courses: 1 })
      .exec();
    if (!findMyCourses) {
      res.json({ status: "error", msg: "No Courses Available" });
    } else {
      const courses = await paginationById(therapist, page, id);
      // const courses = await paginationById(course, page, id);
      if (courses.error) {
        res.json({ status: "error", error: courses.error });
      } else {
        res.json({ status: "ok", response: { courses } });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error occured" });
  }
};

exports.searchBar = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // const { token } = req.body;
    // console.log(req.body.token);
    const decoded = jwt.decode(token, { complete: true });
    const _id = decoded.payload.id;
    console.log(_id);
    const { search } = req.query;
    // var result = search.replace(/\s+/g, "").trim();
    var result = search;
    const whites = new RegExp(/\A\s*\z/);
    if (whites.test(result)) {
      res.json({ status: "ok", msg: "No results Found" });
    } else {
      const regex = new RegExp("^" + result, "i");
      const allGetCourses = await course
        .find({ instructor: _id, course_title: { $regex: regex } })
        .populate("ratings", "rates")
        .populate("instructor", "name")
        .exec();
      let getCourses = [];
      allGetCourses.forEach((course) => {
        let comp = {};
        let sum = 0;
        let toPush = {};
        course.ratings.forEach((rate) => {
          sum += rate.rates;
        });
        avgRate = sum / course.ratings.length;
        console.log(avgRate);
        course.rates = avgRate;
        let newObj = {
          _id: course._id,
          category: course.category,
          instructorName: course.instructor.name,
          course_title: course.course_title,
          video: course.video,
          photo: course.photo,
          offer_price: course.offer_price,
          original_price: course.original_price,
          tags: course.tags,
          language: course.language,
          rates: course.rates,
          last_updated: course.last_updated,
          what_youll_learn: course.what_youll_learn,
          ratings: course.ratings,
          sub_heading: course.sub_heading,
          description: course.description,
        };

        //   // comp = avgRate;
        //   // comp.course = course;
        //   // compCourse = course;
        //   // course.rates1 = avgRate;
        //   // console.log("dfs", course.rates1);
        //   // console.log("vgh", compCourse.rates);
        getCourses.push(newObj);
      });

      const allGetTags = await course
        .find({ tags: { $in: regex }, instructor: _id })
        .populate("ratings", "rates")
        .populate("instructor", "name")
        .exec();

      let getTags = [];
      allGetTags.forEach((course) => {
        let comp = {};
        let sum = 0;
        let toPush = {};
        course.ratings.forEach((rate) => {
          console.log(rate);
          sum += rate.rates;
        });
        avgRate = sum / course.ratings.length;
        console.log(avgRate);
        course.rates = avgRate;
        let newObj = {
          _id: course._id,
          category: course.category,
          instructorName: course.instructor.name,
          course_title: course.course_title,
          video: course.video,
          photo: course.photo,
          offer_price: course.offer_price,
          original_price: course.original_price,
          tags: course.tags,
          language: course.language,
          rates: course.rates,
          last_updated: course.last_updated,
          what_youll_learn: course.what_youll_learn,
          ratings: course.ratings,
          sub_heading: course.sub_heading,
          description: course.description,
        };

        //   // comp = avgRate;
        //   // comp.course = course;
        //   // compCourse = course;
        //   // course.rates1 = avgRate;
        //   // console.log("dfs", course.rates1);
        //   // console.log("vgh", compCourse.rates);
        getTags.push(newObj);
        console.log("from tag", getTags[0].rates);
      });

      const instructor1 = Object.assign(getTags, getCourses);
      const whiteSpace = new RegExp(/\A\s*\z/);
      const courses = { instructor1 };
      if (
        (getCourses.length == 0 && getTags.length == 0) ||
        result == "" ||
        result == " " ||
        result == new RegExp(/\A\s*\z/)
      ) {
        res.json({ status: "ok", msg: "No Results Found" });
      } else {
        res.json({
          status: "ok",
          response: { courses },
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "An Error Occured" });
  }
};

exports.getOneInstructor = async (req, res) => {
  try {
    const id = req.params.id;
    const oneInst = await therapist.findOne({ _id: id });
    if (oneInst != null) res.json({ oneInst });
    else {
      res.json({ err: "doesnt exist" });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getInstructors = async (req, res) => {
  try {
    const allInstructors = await therapist.find({});
    res.json({ allInstructors });
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.editDetails = async (req, res) => {
  try {
    // console.log(req.files);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // const { token } = req.body;
    // console.log(req.body.token);
    const decoded = jwt.decode(token, { complete: true });
    const _id = decoded.payload.id;
    console.log(decoded);
    // const _id = decoded.payload.id;
    const { name, email, phone, about_instructor, headline, link } = req.body;
    const validateEmail = await therapist
      .findOne({ email: email, _id: { $ne: _id } })
      .exec();
    console.log("mail ", validateEmail);
    const validatePhone = await therapist
      .findOne({ phone: phone, _id: { $ne: _id } })
      .exec();
    console.log("phone", validatePhone);
    if (validatePhone) {
      res.json({ status: "error", msg: "Phone Number already taken" });
    } else {
      if (validateEmail) {
        res.json({ status: "error", msg: "Email ID already taken" });
      }
      if (req.file) {
        // const photo_url = req.file.location;
        const photo = req.file.filename;
        const editDetails = await therapist
          .findByIdAndUpdate(_id, {
            $set: {
              name,
              email,
              phone,
              about_instructor,
              photo,
              headline,
              link,
            },
          })
          .exec();
        res.json({ status: "photo url added", editDetails });
      } else {
        const editDetails = await therapist
          .findByIdAndUpdate(_id, {
            $set: {
              name,
              email,
              phone,
              about_instructor,
              headline,
              link,
            },
          })
          // inst-headline,name, id
          // cat-name
          // course-subheding,name
          //
          // get-review in instructor name
          .exec();
        res.json({ status: "photo url not added", editDetails });
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.logout = async (req, res) => {
  try {
    const therapist1 = req.admin;
    console.log(therapist1.email);
    therapist.findOneAndUpdate(
      { email: therapist1.email },
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
