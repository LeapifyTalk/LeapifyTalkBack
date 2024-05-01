const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const completedSchema = mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseID: [
      {
        type: Schema.Types.ObjectId,
        ref: "courses",
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const model = mongoose.model("complete", completedSchema);

module.exports = model;
