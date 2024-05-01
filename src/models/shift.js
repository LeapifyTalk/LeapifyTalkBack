const mongoose = require("mongoose");

// Blog JsonMembers

const ShiftSchema = new mongoose.Schema({
    email: { type: String},
    sun : { },
    mon : { },
    tue : { },
    wed : { },
    thu : { },
    fri : { },
    sat : { },
    start: { type: String},
    end: { type: String},
})


// We Will Create a New mongoose.Collection
const Shift = new mongoose.model('Shift', ShiftSchema);
module.exports = Shift;
