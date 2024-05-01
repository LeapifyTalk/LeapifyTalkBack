const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    notifications: [{
        type: String,
    }],
    count: {
        type: Number,
        default: 0
    }
},{timestamp: true})

const model = mongoose.model('Notification', NotificationSchema)

module.exports = model