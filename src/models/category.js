const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const category = new mongoose.Schema({
  name: {
    type: String,
  },
  courses: [
    {
      ref: "courses",
      type: Schema.Types.ObjectId,
    },
  ],
  sub_categories: [
    {
      ref: "subcourses",
      type: Schema.Types.ObjectId,
    },
  ],
});

const category1 = mongoose.model("category", category);
module.exports = category1;
