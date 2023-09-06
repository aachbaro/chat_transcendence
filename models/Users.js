
class User {
    constructor(id, username) {
      this.id = id;
      this.username = username;
      this.channels = [];
    }

    getChannels() {
      return this.channels;
    }
    addChannel(newchannel) {
      this.channels.push(newchannel);
    }
  }

  module.exports = User;