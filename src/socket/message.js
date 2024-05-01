const moment = require("moment")

//prepare the '___ is typing...' message
function prepareIsTypingToClients(socket) {
    return ({
        username: socket.username
    })
}

function formatMessage(socket, message, type) {
    return (
        {
            username: socket.username,
            message: message,
            time: moment().format('MMMM Do YYYY, h:mm:ss a'),
            type: type
        }
    )
}


module.exports = (io, Users) => {


    const users = new Users();
    
    io.on("connection", socket => {
        //each socket is unique to each client that connects:
    
        // Joining a room
        socket.on('join', async({roomId, username}) => {
            socket.join(roomId)

            users.AddUserData(socket.id, username, roomId);

            io.to(roomId).emit('usersList', users.GetUsersList(roomId));
        })
    
        socket.on('message', function(chat) {
            io.to(chat.roomId).emit('newMessage', chat);
        });

        socket.on('comment', function(comment) {
            io.to(comment.roomId).emit('newComment', comment);
        });
        socket.on('like', function(like) {
            io.emit('newLike', like);
        });
    
        socket.on('reaction', function(reaction) {
            io.to(reaction.message.roomId).emit('newReaction', reaction);
       });
    
        //handle isTyping feature
        //istyping - key down
        socket.on('userIsTypingKeyDown', function (undefined) {
            io.emit('userIsTypingKeyDown', [socket.username, prepareIsTypingToClients(socket)]);
        });
        //istyping - key up
        socket.on('userIsTypingKeyUp', function (undefined) {
            io.emit('userIsTypingKeyUp', socket.username);
        });
    
        socket.on('disconnect', function() {
            var user = users.RemoveUser(socket.id);

            if(user){
                io.to(user.room).emit('usersList', users.GetUsersList(user.room));

            }
        })
    })
    
}
