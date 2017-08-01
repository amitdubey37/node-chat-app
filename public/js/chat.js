var socket = io();

function scrollToButton() {
  //selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');
  // Heights

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();
  console.log(clientHeight , scrollTop , newMessageHeight , lastMessageHeight);
  console.log(scrollHeight)
  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    console.log('should scroll');
  }
}
socket.on('connect', function() {
  var params = $.deparam(window.location.search);
  socket.emit('join', params, function(err) {
    if(err) {
        alert(err);
        window.location.href = '/';
    } else {

    }
  })
  console.log('connected to server')
})
socket.on('disconnect', function() {
  console.log('disconnected from server')
})

socket.on('updateUserList', function(users) {

  var ol = $('<ol> </ol>');

  users.forEach(function(user, i) {
    console.log('called', i)
    ol.append($('<li></li>').text(user));
  })


  $('#users').html(ol);
})

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('h:mm');
  // var li = $('<li></li>')
  // li.text(`${message.from} ${formattedTime}: ${message.text}`)
  // $('#messages').append(li);
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  $('#messages').append(html);
  scrollToButton();
});

socket.on('newLocationMessage', function(message) {
  console.log('message', message)
  var formattedTime = moment(message.createdAt).format('h:mm');
  var template = $('#location-message-template').html();
  var html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  });
  $('#messages').append(html);
  scrollToButton();
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
