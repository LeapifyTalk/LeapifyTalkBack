const mongoose = require("mongoose");

// File JsonMembers

const FileSchema = new mongoose.Schema({
    P_email : { type: String },
    D_email : { type: String },
    P_name : { type: String },
    D_name : { type: String },
    Date : { type: String },
    File : { type: String},
})


// We Will Create a New mongoose.Collection
const File = new mongoose.model('File', FileSchema);
module.exports = File;
