const Chat = require("../models/chats");
const ChatRoom = require("../models/chatRoom");
const User = require("../models/user");
const moment = require("moment");
const addNotification = require("../utils/notifications");

exports.addChat = async (req, res) => {
  const { roomId, message, type, username } = req.body;

  let imageUrl = [];
  if (req.files) {
    req.files.forEach((file) => {
      console.log(file);
      imageUrl.push(
        // "https://e607-116-68-82-246.ngrok.io/" + "uploads/" + file.filename
        // req.file.location
        file.location
      );
    });
    // console.log(req.file.location);
  }
  try {
    const chatCreated = await Chat.create(
      {
        message,
        roomId,
        type,
        username,
        imageUrl,
      }
      // { expireAfterSeconds: 60 * 5 }
    );

    const room = await ChatRoom.findOneAndUpdate(
      { _id: roomId },
      { $push: { chats: chatCreated._id } }
    ).exec();
    // room.chats.push(chatCreated._id);
    // await room.save();
    console.log(chatCreated._id);
    return res.json({
      status: "ok",
      msg: "Chat added successfully",
      chat: chatCreated,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: "error",
      msg: "internal server error",
    });
  }
};

// todo :
exports.removeChat = async (req, res) => {};

exports.likeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    // add a notification
    const username = await chat.username;
    const user = await User.findOne({ username });
    await addNotification(user._id, "your message recieved a like");

    if (!chat.likes.includes(req.user._id)) {
      await chat.updateOne({ $push: { likes: req.user._id } });
      res.status(200).json({
        status: "ok",
        msg: "chat liked successfully",
      });
    } else {
      await chat.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).json({
        status: "ok",
        msg: "chat disliked successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err,
    });
  }
};

exports.commentChat = async (req, res) => {
  const commentObj = {
    comment: req.body.comment,
    postedBy: req.user._id,
    username: req.user.username,
  };

  try {
    const chat = await Chat.findById(req.params.id);
    await chat.updateOne({ $push: { comments: commentObj } });

    // add a notification
    const username = await chat.username;
    const user = await User.findOne({ username });
    const resp = await addNotification(
      user._id,
      "your message recieved a comment"
    );
    console.log(resp);
    res.status(200).json({
      status: "ok",
      msg: "Commented successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err,
    });
  }
};

exports.reportChat = async (req, res) => {
  const reportObj = {
    comment: req.body.comment,
    postedBy: req.user._id,
    postedOn: moment(),
  };

  try {
    const chat = await Chat.findById(req.params.id);
    await chat.updateOne({ $push: { reports: reportObj } });
    res.status(200).json({
      status: "ok",
      msg: "Reported successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err,
    });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    return res.json({
      status: "ok",
      chat: chat,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err,
    });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { reaction } = req.body;
    const { id } = req.params;
    const chat = await Chat.findOne({ _id: id });
    chat.reactions.push(reaction);
    await chat.save();

    return res.json({
      status: "ok",
      msg: "reaction added successfully",
      chat: chat,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: "error",
      msg: "internal server error",
    });
  }
};
