// YOUR CODE HERE:
$(document).ready(function(){
  $('.submit').on('click', function(e){
    // debugger;
    e.preventDefault();
    console.log('button clicked');
    app.handleSubmit();
  });
  $(document.body).on('change', '#roomSelect', function(e) {
    // e.preventDefault();
    app.roomName = $(this).val();
    app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=1000&roomname=' + app.roomName);
  });

});
var app = {
  init: function(messages) {
    // var messages = this.fetch('https://api.parse.com/1/classes/chatterbox');
    // console.log(messages)
    function GetURLParameter(sParam){
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
          return sParameterName[1];
        }
      }
    }

    app.userName = GetURLParameter('username');
    console.log(app.userName);
    app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=1000&roomname=' + app.roomName);
  },
  send: function(message){
    $.ajax({
  // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent. Data: ', data);
        // Show something on the page to user that message sent.
        app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=1000&roomname=' + app.roomName);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message. Error: ', data);
        // Show the error to the user
      }
    });
  },
  fetch: function(url){
    $.ajax({
  // This is the url you should use to communicate with the parse API server.
      url: url, // + '?order=-createdAt&limit=1000&roomname=' + app.roomName,
      type: 'GET',
      data: 'json',
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message fetched. Data: ', data);
        app.refreshView(data.results);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch message. Error: ', data);
      }
    });
  },
  refreshView: function(messages){
    var a = messages.map(function(content){
      if(app.rooms.indexOf(content.roomname) === -1){
        app.rooms.push(content.roomname);
      }
      var $div = $('<div class="content">');
      $div.html(escapeHtml(content.username) + '<br>' + escapeHtml(content.text) + '<br>' + escapeHtml(content.roomname));
      return $div;
    });
    $('#chats').html(a);
    $('.roomList').children().remove();
    var $select = $('<select id="roomSelect">');
    // $select.children().remove();
    $select.append('<option value="New Room">New room...</option>');
    for (var i = 0; i < app.rooms.length; i++) {
      $select.append('<option value="' + escapeHtml(app.rooms[i]) +'">'+ escapeHtml(app.rooms[i]) + '</option>');
    };
    $('.roomList').append($select);
  },
  clearMessages: function(){

    $('#chats').children().remove();
  },
  addMessage: function(message){
    var $div = $('<div>');
    $div.html(message.username);
    $('#chats').prepend($div);
    app.send(message);
  },
  addRoom: function(roomname){
    app.rooms.push(roomname);
    var $option = $('<option value="' + roomname + '">');
    $option.html(roomname);
    $('#roomSelect').append($option);
  },
  addFriend: function(){

  },
  handleSubmit: function(){

    var text = $('input').val().trim();
    var roomName = 'HRR9';
    var message = new Message(app.userName, text, roomName);
    app.send(message);
  },
  userName: undefined,
  rooms: [],
  roomName: undefined,
};
var Message = function(username, text, roomName){
  this.username = username;
  this.text = text;
  this.roomname = roomName;
};

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    "\n" : '<br>',
};

var escapeHtml = function (string) {
  return String(string).replace(/[&<>"'\/]|[\n]/g, function (s) {
    return entityMap[s];
  });
};

