const Notification = require('../models/notification')
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.clearAll = async (req, res) => {
    try{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        // console.log(token);
        const findToken = await User.findOne({ tokens: token }).exec();
        const decoded = jwt.decode(findToken.tokens, { complete: true });
        const userID = decoded.payload.id;

        const notification = await Notification.findOneAndUpdate({userId:userID}, {$set: {notifications: [], count: 0}})
        
        return res.json({
            status: 'ok',
            notification: notification
        })
    } catch(e) {
        return res.json({
            status: 'error',
            msg: e
        })
    }
}

exports.getAll = async (req, res) => {
    try{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        // console.log(token);
        const findToken = await User.findOne({ tokens: token }).exec();
        const decoded = jwt.decode(findToken.tokens, { complete: true });
        const userID = decoded.payload.id;
        const notification = await Notification.findOne({userId: userID})
        return res.json({
            status: 'ok',
            notification: notification
        })
    } catch(e) {
        return res.json({
            status: 'error',
            msg: e
        })
    }

}