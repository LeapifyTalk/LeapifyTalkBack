const jwt = require("jsonwebtoken");
const User = require("../models/user");
const admin = require("../models/admin");
const therapist = require("../models/therapists");
const companion = require("../models/companion");
const express = require("express");
// auth for student
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id, tokens: token });
    if (!user) {
      res.status(401).send({ error: "Please authenticate." });
    } else {
      req.token = token;
      req.role = user;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "Please authenticate." });
  }
};

// auth for therapist

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await therapist.findOne({ _id: decoded.id, tokens: token });
    if (!admin) {
      res.status(401).send({ error: "Please authenticate." });
    } else {
      req.token = token;
      req.role = admin;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "Some error occured" });
  }
};

const adminAuthLeapify = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin1 = await admin.findOne({ _id: decoded.id, tokens: token });
    if (!admin1) {
      res.status(401).send({ error: "Please authenticate." });
    } else {
      req.token = token;
      req.role = admin1;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "Some error occured" });
  }
};

const decodeTokenTherapist = (tokens) => {
  const findToken = therapist
    .findOne({
      tokens: tokens,
    })
    .exec();
  findToken.then((msg) => {
    return msg;
  });
  // if (!findToken) {
  //   return null;
  // } else {
  //   const decoded = jwt.decode(findToken, { complete: true });
  //   console.log(decoded);
};
module.exports = { auth, adminAuth, adminAuthLeapify, decodeTokenTherapist };

// const findCourse = await ongoing.findOne({ userID, courseID }).exec();

// if (!findCourse) {
//   const progress = (1 / validateCourse.sections.length) * 100;
//   const findInComplete = await completed.findOne({ userID }).exec();
//   if (progress==100) {
//     if (!findInComplete) {
//       const addToCompleted = await completed.create({
//         courseID,
//         userID,
//       });
//       console.log("1016 ", addToCompleted);
//       return res.json({
//         status: "ok",
//         msg: { addToCompleted },
//       });
//     }
//     // second completed
//     else{
//       const deleteFromOngoing = await ongoing
//         .findOneAndDelete({ userID, courseID })
//         .exec();
//       console.log("1025 ", findInComplete);
//       // Another completed course
//       const updateCompleted = await completed
//         .findOneAndUpdate({ userID }, { $addToSet: { courseID } })
//         .exec();
//       return res.json({
//         status: "ok",
//         msg: {
//           updateCompleted,
//           deleteFromOngoing,
//         },
//       });
//     }
//   }
//   // progress!=100
//   else{
//     const addToOngoing = await ongoing.create({
//       userID,
//       courseID,
//       sections: sectionID,
//       progress,
//     });

//     return res.json({
//       status: "ok",
//       msg: { addToOngoing },
//     });
//   }
// }
// // ongoing already
// else{
//   const findSection = await ongoing
//     .findOne({ userID }, { sections: { $elemMatch: { $eq: sectionID } } })
//     .exec();
//     if(findSection)

// }
