const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    isPrivate: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("ChatRoom", ChatRoomSchema);

module.exports = model;
