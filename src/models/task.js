const mongoose = require("mongoose");

// Task JsonMembers

const TaskSchema = new mongoose.Schema({
    email: { type: String},
    check: { type: String},
    note : { type: String}
})


// We Will Create a New mongoose.Collection
const Task = new mongoose.model('Task', TaskSchema);
module.exports = Task;
