class Channel {
    constructor(id, name) {
        this.id = id;
        this.users = [];
        this.name = name;
        this.messages = [];
    }

    getUsers() {
        return this.users;
    }
}

module.exports = Channel;