const mongoose = require("mongoose");
const quiz = require("../models/quiz");
const question = require("../models/questions");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const complete = require("../models/completed");
const preference = require("../models/preference");

exports.makeQuiz = async (req, res) => {
  const { name } = req.body;
  const {type}=req.query

  try {
    const newQuiz = await quiz.create({
      name,type
    });

    // console.log(newQuiz);

    res.json({ status: "ok", msg: "Quiz created" });
  } catch (e) {
    // console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};
exports.makeQuestion = async (req, res) => {
  const quizID = req.params.quizID;
  const { question_no, questionText, options } = req.body;
  let {answer,comprehension}=req.body
    const {type}=req.query

    if(type=='preference'){
      answer=null
      comprehension=null
    }
    if(type=='botchat'){
      comprehension=null
    }
  try {
    const split_options = options.split(",");

    const newQuestion = await question.create({
      quizID,
      comprehension,
      question_no,
      questionText,
      answer,
      options: split_options,
    });

    const edit_quiz = await quiz.findByIdAndUpdate(quizID, {
      $push: { questions: newQuestion._id },
    });

    res.json({ status: "ok", msg: "Question Created" });
  } catch (e) {
    // console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const id = req.params.id;

    try {
      const sendQuiz = await quiz
        .findById(id)
        .populate(["questions", "lastAttempted"])
        .exec();
      if (!sendQuiz) {
        res.json({ status: "error", msg: "Wrong id" });
      } else {
        res.json({ status: "ok", sendQuiz });
      }
    } catch (e) {
      const sendQuiz = await quiz.findById(id).populate("questions").exec();
      if (!sendQuiz) {
        res.json({ status: "error", msg: "Wrong id" });
      } else {
        res.json({ status: "ok", sendQuiz });
      }
    }
  } catch (e) {
    // console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.postPreference = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  const quizID = req.body.id;
  const {type}=req.query
  try {
    const { data } = req.body;
    // const newQuiz = await preference.create({
    for (const qn of data) {
      const answer = qn.answers;
      const questionID = qn.id;
      const newPref = await preference.create({
        type,
        answer,
        questionID,
        preferenceID:quizID,
        userID,
      });
    }
    findToken.isPreferenceAdded = true;
    await findToken.save();
    res.json({ status: "ok", msg: "Form Submitted" });
    // }
    //     name,
    //   });

    //   console.log(newQuiz);

    //   res.json({ status: "ok", msg: "Preference form created" });
  } catch (e) {
    // console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.postBotchat=async(req,res)=>{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  const quizID = req.body.id;
  // const {type}=req.query
  const {answer,questionID}=req.body
  try{
    const newPref = await preference.create({
        type:'botchat',
        answer,
        questionID,
        preferenceID:quizID,
        userID,
      });

      return res.json({ status: "ok", msg: "Response stored" });

  }catch(e){
    // console.log(e)
    return res.json({status:"error",msg:"an error occured"})
  }

}

exports.getBotchat=async(req,res)=>{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  try{
    const findBot=await preference.find({userID,type:"botchat"})
    .populate(["questionID","preferenceID"]).exec()
    return res.json({status:"ok",findBot})
  }catch(e){
    // console.log(e)
    return res.json({status:"error",msg:"an error occured"})
  }
}

exports.getQuestion = async (req, res) => {
  try {
    const id = req.params.id;

    const sendQuestion = await question
      .findById(id, { answer: 0 })
      .populate("quizID")
      .exec();

    if (!sendQuestion) {
      res.json({ status: "error", msg: "Wrong id" });
    } else {
      res.json({ status: "ok", sendQuestion });
    }
  } catch (e) {
    // console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};
exports.finishQuiz = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;
  try {
    // const { id } = req.params;
    // const forQuiz = await quiz.findById(id);
    // const result = findToken.currentScore / forQuiz.questions.length;
    const result = findToken.currentScore / 5;
    // console.log("Quiz",forQuiz);
    console.log("Result",result);
    if (result >= 0.5) {
      const updateUser = await user
        .findByIdAndUpdate(userID, { quizStatus: "passed" })
        .exec();
      return res.json({
        status: "ok",
        msg: "Congratulations! Now you are a companion.",
      });
    } else {
      const updateUser = await user
        .findByIdAndUpdate(userID, {
          quizStatus: "failed",
          lastAttempted: null,
          currentScore: 0,
        })
        .exec();
      const removeFromCompleted = await complete
        .findOneAndDelete({ courseID: findToken.companion_course, userID })
        .exec();
      return res.json({
        status: "failed",
        testAvailability: false,
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};

exports.checkAnswer = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const findToken = await user.findOne({ tokens: token }).exec();
  const decoded = jwt.decode(findToken.tokens, { complete: true });
  const userID = decoded.payload.id;

  const { id } = req.params;
  const { answer } = req.body;

  try {
    // const updateAttempted = await user.findById(userID).exec();
    const findQuestion = await question.findById(id).exec();
    if (!findQuestion) {
      return res.json({ status: "error", msg: "wrong id" });
    } else if (findQuestion.answer == answer) {
      findToken.lastAttempted = id;
      findToken.currentScore += 1;
      await findToken.save();
      return res.json({
        status: "ok",
        msg: "correct answer",
        currentScore: findToken.currentScore,
      });
    } else if (answer == null) {
      findToken.lastAttempted = id;
      return res.json({
        status: "ok",
        msg: "timeout",
        currentScore: findToken.currentScore,
      });
    } else {
      findToken.lastAttempted = id;
      // updateAttempted.currentScore += 0;
      await findToken.save();
      return res.json({
        status: "ok",
        msg: "incorrect answer",
        currentScore: findToken.currentScore,
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: "an error occured" });
  }
};
