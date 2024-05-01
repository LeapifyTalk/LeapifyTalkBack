const ChatRoom = require("../models/chatRoom");
const Chat = require("../models/chats");
const User = require("../models/user");
exports.privateRoom = async (req, res) => {
  const { name } = req.body;

  try {
    const roomCreated = await ChatRoom.create({
      name: name,
      isPrivate: true,
    });

    return res.json({
      status: "ok",
      msg: "Room Created Successfully",
      room: roomCreated,
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({
        status: "error",
        msg: "This room name already exists",
      });
    }
    throw e;
  }
};
exports.createRoom = async (req, res) => {
  const { name } = req.body;

  try {
    const roomCreated = await ChatRoom.create({
      name: name,
    });

    return res.json({
      status: "ok",
      msg: "Room Created Successfully",
      room: roomCreated,
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.json({
        status: "error",
        msg: "This room name already exists",
      });
    }
    throw e;
  }
};

// todo : check if user already present then return a resp accordingly
exports.addMember = async (req, res) => {
  try {
    const { userId, roomId, companionId } = req.body;

    const room = await ChatRoom.findOne({ name: roomId });
    room.userIds.addToSet(userId);
    room.userIds.addToSet(companionId);

    const user = await User.findOne({ _id: userId });
    const user2 = await User.findOne({ _id: companionId });
    user.rooms.addToSet(room._id);
    user2.rooms.addToSet(room._id);

    await user2.save();
    await room.save();
    await user.save();

    return res.json({
      status: "ok",
      msg: "Member added successfully",
      room: room,
    });
  } catch (e) {
    console.log(e);
    return res.json({ status: "error", msg: "an error occured" });
  }
};

// todo : check if user is already removed then return a resp accordingly
exports.removeMember = async (req, res) => {
  const { userId, roomId } = req.body;

  const room = await ChatRoom.findOne({ _id: roomId });
  room.userIds.pull(userId);

  const user = await User.findOne({ _id: userId });
  user.rooms.pull(roomId);

  await user.save();
  await room.save();

  return res.json({
    status: "ok",
    msg: "Member removed successfully",
    room: room,
  });
};

exports.getAllChats = async (req, res) => {
  const { roomId } = req.query;

  try {
    const room = await ChatRoom.findOne({ _id: roomId }).populate("chats");
    return res.json({
      status: "ok",
      msg: "received all the chats for this room",
      chats: room.chats,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: "error",
      msg: e,
    });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    return res.json({
      status: "ok",
      room: room,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: err,
    });
  }
};
