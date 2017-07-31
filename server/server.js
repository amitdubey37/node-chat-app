const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')
const app = express();

var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
  console.log('new user connected');
  socket.on('createMessage', (message) => {
    console.log('createMessage', message);
    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    });
  });
  socket.on('disconnect', () => {
    console.log('disconnected from client')
  })


})

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('server is running at port ' + port)
})
