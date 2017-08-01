const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

var users = new Users();

const {generateMessage, generateLocationMessage} = require('./utils/message');

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')
const app = express();

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
  console.log('new user connected');


  socket.on('join', (params, callback) =>  {
    var userName = params.name
      if( !isRealString(userName) || !isRealString(params.room)) {
        console.log('inside if')
        return callback('Name and room name are required');
      }
      var allUsers = users.getUserList(params.room);
      if(allUsers.filter((user) => user === userName).length>0) {
        return callback(`A user with name ${userName} is already in ${params.room}`);
      }
      socket.join(params.room);
      users.addUser(socket.id, params.name, params.room);

      io.to(params.room).emit('updateUserList', users.getUserList(params.room))
      // socket.leave('room name');

      //io.emit
      //socket.broadcast.emit
      //socket.emit

      socket.emit('newMessage', generateMessage( 'Admin','Welcome to the chat app'));
      socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

      callback();
  });
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if(user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });
  socket.on('disconnect', () => {
    console.log('disconnected from client')
    var user = users.removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`))
    }
  })


})

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('server is running at port ' + port)
})
