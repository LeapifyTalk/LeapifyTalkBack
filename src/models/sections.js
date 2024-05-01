const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const section = mongoose.Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    section_name: {
      type: String,
    },
    lesson_name: [
      {
        type: String,
      },
    ],
    files: [
      {
        type: Object,
      },
    ],
    description: [
      {
        type: String,
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const sections = mongoose.model("section", section);
module.exports = sections;
