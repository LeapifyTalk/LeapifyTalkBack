const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const purchasedSchema = mongoose.Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseID: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    instructorID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const model = mongoose.model("purchased", purchasedSchema);
module.exports = model;
