const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courses = new mongoose.Schema(
  {
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
    },
    course_title: {
      type: String,
    },
    video: {
      type: String,
    },
    photo: {
      type: String,
    },
    original_price: {
      type: Number,
    },
    offer_price: {
      type: Number,
    },
    tags: {
      type: Array,
    },
    language: {
      type: String,
      default: "English",
    },
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "rating",
      },
    ],
    last_updated: {
      type: Date,
      default: Date.now(),
    },
    sub_heading: {
      type: String,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    approved: {
      type: Boolean,
      default: false,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    what_youll_learn: [
      {
        type: String,
      },
    ],
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "section",
      },
    ],
    description: {
      type: String,
    },
    comments: {
      type: String,
    },
    best_seller: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    notApproved: {
      type: Boolean,
    },
    onHold: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const course = mongoose.model("courses", courses);
module.exports = course;
