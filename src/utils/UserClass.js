class Users {
  constructor() {
    this.users = [];
    this.companions = [];
    this.onlyCompanions = [];
  }
  AddCompanionAndStudent(userId, socketId) {
    let companion = { userId, socketId };
    this.companions.push(companion);
    // this.onlyCompanions.push(companion)
    return companion;
  }

  AddOnlyCompanion(userId, socketId) {
    let companion = { userId, socketId };
    this.onlyCompanions.push(companion);
    // this.onlyCompanions.push(companion)
    return companion;
  }

  GetOnlyCompanions() {
    var allUser = this.onlyCompanions;
    return allUser;
  }

  removerCompanion(userId) {
    let user = getCompanion(userId);
    if (user) {
      this.companions = this.companions.filter(
        (companion) => companion.userId !== userId
      );
    }
    return user;
  }

  getCompanion(id) {
    var user = this.companions.filter((companion) => companion.userId === id);
    return user;
  }
  // users online in group
  AddUserData(id, name, room) {
    var users = { id, name, room }; //object disractury
    this.users.push(users);
    return users;
  }
  // get all online users
  GetAllUser() {
    var allUser = this.companions;
    return allUser;
  }
  //to remover from friend online list
  RemoveUser(id) {
    var user = this.GetUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }

  GetUser(id) {
    var getUser = this.users.filter((userId) => {
      //get all user id
      return userId.id === id;
    })[0];
    return getUser;
  }

  GetUsersList(room) {
    var users = this.users.filter((user) => user.room === room); //all room in z array that muches z room name be added into new array
    var namesArray = users.map((user) => user.name);

    return namesArray;
  }
}

module.exports = { Users };
