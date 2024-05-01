const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subcategory = new mongoose.Schema({
  name: {
    type: String,
  },
  category: {
    ref: "category",
    type: Schema.Types.ObjectId,
  },
  course: [
    {
      ref: "courses",
      type: Schema.Types.ObjectId,
    },
  ],
});

const subcategory1 = mongoose.model("subcategory", subcategory);
module.exports = subcategory1;
