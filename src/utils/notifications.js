const Notification = require('../models/notification')


const addNotification = async (userId, notificationTxt) => {

    try{
        const notification = await Notification.findOne({userId})

        if(!notification){
            const notificationCreated = await Notification.create({
                userId: userId,
                notifications: []
            })
            notificationCreated.notifications.push(notificationTxt)
            notificationCreated.count += 1
            await notificationCreated.save()
            return (
                {status: 'ok', msg: 'notification added'}
            )
        }
        notification.notifications.push(notificationTxt)
        notification.count += 1
        await notification.save()
        return (
            {status: 'ok', msg: 'notification added'}
        )

    } catch (e) {
        return (
            {status: 'error', msg: e}
        )
    }
}

module.exports = addNotification