//const { Socket } = require('engine.io');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { channel } = require('diagnostics_channel');
const Channel = require('./models/Channel');
const User = require('./models/Users');
const Message = require('./models/Message');

// DECLARATIONS

const listChannels = [];
const listUsers = [];
const increment = createIncrementer();

// ROUTES

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
})

// REQUETES

io.on('connection', (socket) => {

// GESTION DES CONNEXION
    io.emit("updateChanLst", listChannels);
    socket.on('setUserName', (name) => {
        const newUser = new User(socket.id, name);
        listUsers.push(newUser);
        socket.emit('setUserName', name);
        console.log("liste des users:");
        console.log(listUsers);
     })

// GESTION DES MESSAGES;
     socket.on("chat_message", (msg, targetChannel) => {
        // relayage du message vers tous les ecouteurs
        const newMessage = new Message(getUserByID(socket.id), msg)
        getChannelByID(targetChannel).getMessages().push(newMessage);
        io.emit("chat_message", msg);
        io.emit("updateChatBox", getChannelByID(targetChannel), getChannelByID(targetChannel).getMessages());
     })

// GESTION CHANNELS
   //creation d'un nouveau channel
     socket.on("create_channel", (nameChannel) => {
        // creation du chan
        const newChannel = new Channel(increment(), nameChannel);
        actualChanId = newChannel.id;
        //ajout du user
        const newChanUser = getUserByID(socket.id);
        //newChannel.users.push(newChanUser);

        //ajout du chan a la liste
        listChannels.push(newChannel);
        //getUserByID(socket.id).addChannel(newChannel.id);
        addUserToChannel(newChannel, newChanUser);

        io.emit("updateChanLst", listChannels);
        console.log("Listes des channels:");
        console.log(listChannels);
        //console.log((listChannels.find(channel => channel.id === actualChanId)).getUsers());
     })
   
   //Rejoindre un channel
     socket.on("joinChannel", channelRequest => {
      if (getChannelByName(channelRequest)) {
         addUserToChannel(getChannelByName(channelRequest), getUserByID(socket.id));
      }
     })

   // Selection du canal dans la chat box
     socket.on("selectChan", (chanID) => {
      if (isUserInChannel(getChannelByID(chanID), getUserByID(socket.id))) {
         io.emit("selectedChannel", getChannelByID(+chanID));
         io.emit("updateChatBox", getChannelByID(+chanID), getChannelByID(+chanID).getMessages());
      }
   })
});


server.listen(3000, () => {
    console.log('Listen on port 3000')
})

// UTILS

function addUserToChannel(channel, user) {
   if (!isUserInChannel(channel, user)) {
      user.addChannel(channel.id);
      channel.users.push(user);
   }
   else { console.log("User already in channel."); }
}

function isUserInChannel( channel, user) {
   const copy = new Channel(channel);
   copy.getUsers().find(userinchan => userinchan.id === user.id);
   if (!(copy.getUsers().find(userinchan => userinchan.id === user.id))){ return (0); }
   else { return (1); }
}

function createIncrementer() {
    let count = 0; // Initialisation du compteur
  
    return function() {
      return count++; // Incrémentation du compteur et renvoi de la valeur actuelle
    };
}




function getChannelByID(chanID) {
   return listChannels.find(channel => channel.id === chanID);
}

function getChannelByName(chanName) {
   return listChannels.find(channel => channel.name === chanName);
}

function getUserByID(userID) {
   return listUsers.find(user => user.id === userID);
}