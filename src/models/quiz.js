var mongoose = require("mongoose");
const Schema = mongoose.Schema;
var quizSchema = mongoose.Schema({
  questions: [
    {
      ref: "question",
      type: Schema.Types.ObjectId,
    },
  ],
  name: {
    type: String,
  },
  photo: {
    type: String,
  },
  type:{
    type: String,
  }
});

const quizs = mongoose.model("quiz", quizSchema);
module.exports = quizs;
