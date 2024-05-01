module.exports = (io, Users) => {
  const users = new Users();
  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("companionConnection", (companionId, role) => {
      users.AddCompanionAndStudent(companionId, socket.id);
      console.log(role);
      if (role == "companion") {
        users.AddOnlyCompanion(companionId, socket.id);
      }
    });
    
    socket.on("connectCompanion", (data) => {
      const room = data.userId + data.companionId
      // socket.join(room);
      
      let companion = users.getCompanion(data.companionId);
      users.AddUserData(socket.id, data.userId, room);
      const getUser = users.GetUser(socket.id);
      // console.log(companion[0].socketId,"c SocketID");
      io.to(companion[0].socketId).emit("sendRoom", getUser, data);
    });

    socket.on("getOnlineCompanion", () => {
      let user = users.GetOnlyCompanions();
      socket.emit("sendOnlineCompanion", user);
      // return users;
    });

    socket.on("requestRejected", (data) => {
      const companionName = users.getCompanion(data);
      io.to(companionName[0].socketId).emit("notAccepted", data);
    });

    socket.on("requestAccepted", (companionId, userId) => {
      console.log(companionId, userId);
      // const userID= await fetchUserId()
      let reciever = users.getCompanion(userId);
      let roomId = companionId + userId;
      socket.join(socket.id);
      console.log("roomId", roomId);
      io.to(reciever[0].socketId).emit(
        "acceptedChat",
        roomId,
        companionId
      );
    });
    socket.on("joinChat", (roomid) => {
      socket.join(roomid);
    });
  });
};
