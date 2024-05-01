var mongoose = require("mongoose");
const Schema = mongoose.Schema;
var questionSchema = mongoose.Schema({
  quizID: {
    ref: "quiz",
    type: Schema.Types.ObjectId,
  },
  comprehension: {
    type: String,
  },
  question_no: {
    type: Number,
  },
  questionText: {
    type: String,
    required: true,
  },
  answer: {
    type: Number,
    // required: true,
  },
  options: {
    type: Array,
    default: [],
  },
});
const questions = mongoose.model("question", questionSchema);
module.exports = questions;
