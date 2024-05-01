const mongoose = require("mongoose");

// MappingData JsonMembers

const MappSchema = new mongoose.Schema({
    _id: { type: String},
    
})


// We Will Create a New mongoose.Collection
const MappingData = new mongoose.model('MappingData', MappSchema);
module.exports = MappingData;
