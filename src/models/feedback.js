const mongoose = require("mongoose");

// Feedback JsonMembers

const FeedbackSchema = new mongoose.Schema({
    P_email : { type: String },
    D_email : { type: String },
    P_name : { type: String },
    D_name : { type: String },
    C_Date : { type: String },
    Rating : { type: String },
    Message : { type: String },
    Status : { type: String},
})


// We Will Create a New mongoose.Collection
const Feedback = new mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;
