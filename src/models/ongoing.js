const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const ongoingSchema = mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseID: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "section",
      },
    ],
    progress: [
      {
        type: Number,
        default: 0,
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const model = mongoose.model("ongoing", ongoingSchema);

module.exports = model;
