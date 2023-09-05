//const { Socket } = require('engine.io');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { channel } = require('diagnostics_channel');
const Channel = require('./models/Channel');
const User = require('./models/Users')

// DECLARATIONS

const listChannels = [];
const listUsers = [];
const increment = createIncrementer();

// ROUTES

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`)
})

// REQUETES

io.on('connection', (socket) => {
    io.emit("updateChanLst", listChannels);
    //gestion de connexion
    socket.on('setUserName', (name) => {
        const newUser = new User(socket.id, name);
        listUsers.push(newUser);
        socket.emit('setUserName', name);
        console.log(listUsers);
     })

    // gestion des messages;
     socket.on("chat_message", (msg) => {
        // relayage du message vers tous les ecouteurs
        io.emit("chat_message", msg);
     })

     // gestion des channels
     socket.on("create_channel", (nameChannel) => {
        // creation du chan
        const newChannel = new Channel(increment(), nameChannel);
        actualChanId = newChannel.id;
        //ajout du user
        const newChanUser = listUsers.find(users => users.id === socket.id);
        newChannel.users.push(newChanUser);
        //ajout du chan a la liste
        listChannels.push(newChannel);


        io.emit("updateChanLst", listChannels);
        console.log(listChannels);
        //console.log((listChannels.find(channel => channel.id === actualChanId)).getUsers());
     })

     // Selection du canal dans la chat box
     socket.on("selectChan", (chanID) => {
      foundedChannel = listChannels.find(channel => console.log(channel.id) === console.log(chanID));
      console.log(foundedChannel);
      io.emit("selectedChannel", listChannels.find(channel => channel.id === chanID));
   })
});


server.listen(3000, () => {
    console.log('Listen on port 3000')
})

// UTILS

function createIncrementer() {
    let count = 0; // Initialisation du compteur
  
    return function() {
      return count++; // Incrémentation du compteur et renvoi de la valeur actuelle
    };
}