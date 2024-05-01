const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const preferenceSchema = mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    preferenceID: {
      type: Schema.Types.ObjectId,
      ref: "quiz",
    },
    questionID: {
      type: Schema.Types.ObjectId,
      ref: "question",
    },
    answer: {
      type: Array,
    },
    type:{
      type:String
    },

  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const model = mongoose.model("preference", preferenceSchema);

module.exports = model;
