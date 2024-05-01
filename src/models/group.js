const mongoose = require("mongoose");

// GroupsData JsonMembers

const GroupsSchema = new mongoose.Schema({
  // _id: { type: String },
  name: { type: String },
  members: [{ type: String }],
  aboutMe: { type: String },
});

// We Will Create a New mongoose.Collection
const GroupData = new mongoose.model("GroupData", GroupsSchema);
module.exports = GroupData;
