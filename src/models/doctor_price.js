const mongoose = require("mongoose");

// Task JsonMembers

const DoctorPriceSchema = new mongoose.Schema({
    email : { type : String},
    ta_value: { type: String},
    g_value: {type: String},
    z_value: {type: String},
    s_value: {type: String},
    v_value: {type: String},
    v_price: {type: String},
    v_bundle: {type: String},
    v_discount: {type: String},
    vr_value: {type: String},
    vr_price: {type: String},
    vr_bundle: {type: String},
    vr_discount: {type: String},
    txt_value: {type: String},
    txt_price: {type: String},
    txt_bundle: {type: String},
    txt_discount: {type: String},
})


// We Will Create a New mongoose.Collection
const DoctorPrice = new mongoose.model('DoctorPrice', DoctorPriceSchema);
module.exports = DoctorPrice;
