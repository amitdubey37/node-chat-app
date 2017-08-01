var socket = io();
socket.on('connect', function() {
  console.log('connected to server')
})
socket.on('disconnect', function() {
  console.log('disconnected from server')
})

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm');
  var li = $('<li></li>')
  li.text(`${message.from} ${formattedTime}: ${message.text}`)
  $('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm');
  var li = $('<li> </li>');
  var a = $('<a target="_blank"> My Current location </a>');
  li.text(`${message.from} ${formattedTime}: `);
  a.attr('href', message.url);
  li.append(a);
  $('#messages').append(li);
});

// socket.emit('createMessage', {
//   from : 'Amit',
//   text: 'Hello'
// }, function(ack) {
//   console.log(ack);
// })

$('#message-form').on('submit', function(e) {
  e.preventDefault();
  var messageTextBox = $('[name=message]');
  socket.emit('createMessage', {
    from: 'User',
    text: messageTextBox.val()
  }, function() {
    messageTextBox.val('')
  });
})

var locationButton = $('#send-location');
locationButton.on('click', function(){
  if(!navigator.geolocation){
    return alert('Geolocation not supported by you browser')
  }
  locationButton.attr('disabled', 'disabled').text('Sending location...');
  navigator.geolocation.getCurrentPosition(function(position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  }, function() {
      locationButton.removeAttr('disabled');
  })
});
