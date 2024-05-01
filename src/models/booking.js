const mongoose = require("mongoose");

// Booking JsonMembers

const BookSchema = new mongoose.Schema({
    P_email : { type: String },
    D_email : { type: String },
    P_name : { type: String },
    D_name : { type: String },
    Price : { type: String },
    Slot : { type: String },
    Currentdate : { type: String },
    SelectDate : { type: String },
    Day : { type: String },
    Bundle : { type: String },
    MeetLink : { type : String },
    Status : { type: String},
    Note : { type: String},
    File : { type: String},
})


// We Will Create a New mongoose.Collection
const Book = new mongoose.model('Book', BookSchema);
module.exports = Book;
