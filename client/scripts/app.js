// YOUR CODE HERE:
var timeout;

$(document).ready(function(){

  $('#send').on('submit', function(e){
    // debugger;
    e.preventDefault();
    app.handleSubmit();
  });
  //use this because rooms are being dynamically added
  $(document.body).on('change', '#roomSelect', function(e) {
    // e.preventDefault();
    if ($(this).val() === 'New Room') {
      var room = prompt("What's the name of your room?");
      app.addRoom(escapeHtml(room));
      console.log(escapeHtml(room));
      $(this).val(escapeHtml(room));
    }

    app.roomName = $(this).val();

    // var where = encodeURIComponent('where={"roomname":' + app.roomName +'}');

    app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4&where%3D%7B%22roomname%22%3A%22' + escapeHtml(app.roomName) + '%22%7D');

    // app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4&' + where);

  });

  $('#main').on('click', '.username', function(e) {
    console.log('here');
    e.preventDefault();
    // console.log("text:" + $(this).text)
    app.addFriend($(this).text());
  });

  $(document.body).on('click', '.friend', function(e) {
    e.preventDefault();
    app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4&where%3D%7B%22username%22%3A%22' + escapeHtml($(this).text()) + '%22%7D');
  });

});


var app = {
  init: function(messages) {
    // var messages = this.fetch('https://api.parse.com/1/classes/chatterbox');
    // console.log(messages)

    //grabs the username out of url parameter
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

    // // add selectlist for roomlist to the page
    // if ($('.roomList').children().length === 0) {
    //   console.log('select');
    //   var $select = $('<select id="roomSelect">');
    //   $select.append('<option value="New Room">New room...</option>');
    //   $('.roomList').append($select);
    // }

    //sets userName to users name
    app.userName = GetURLParameter('username');
    // console.log(app.userName);
    app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4');

    // setInterval(function(){
    //   app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4&where%3D%7B%22roomname%22%3A%22' + escapeHtml(app.roomName) + '%22%7D');
    // }, 3000);
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
        //grabs posts in descending order
        app.fetch('https://api.parse.com/1/classes/chatterbox?order=-createdAt&limit=4&where%3D%7B%22roomname%22%3A%22' + escapeHtml(app.roomName) + '%22%7D');
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
      url: url, // + '?order=-createdAt&limit=4&roomname=' + app.roomName,
      type: 'GET',
      data: 'json',
      contentType: 'application/json',
      success: function (data) {
        if (timeout) { window.clearTimeout(window.timeout); }
        console.log('chatterbox: Message fetched. Data: ', data);
        app.refreshView(data.results);
        console.log(url);
        window.timeout = setTimeout(function(){app.fetch(url);}, 5000);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch message. Error: ', data);
      }
    });


  },
  refreshView: function(messages){
    var $select = $('<select id="roomSelect">');
    var a = messages.map(function(content){
      if(app.rooms.indexOf(content.roomname) === -1){
        //add rooms to room array
        app.rooms.push(content.roomname);
        // $select.append('<option value="' + escapeHtml(content.roomname) +'">'+ escapeHtml(content.roomname) + '</option>');
      }

      var $div = $('<div class="chat">');
      $div.html('<a href="#" class="username" >' + escapeHtml(content.username) + '</a>' + '<br>' + escapeHtml(content.text) + '<br>' + escapeHtml(content.roomname));
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
    //this makes dropdown menu stay on selected option
    $('#roomSelect').val(app.roomName);
  },
  clearMessages: function(){

    $('#chats').children().remove();
  },
  addMessage: function(message){
    var $div = $('<div>');
    $div.html(message.username);
    $('#chats').prepend($div);
    app.roomName = message.roomname;
    $('#roomSelect').val(message.roomname);
    app.send(message);
  },
  addRoom: function(roomname){
    room = { name: roomname };
    app.rooms.push(roomname);
    var $option = $('<option value="' + roomname + '">');
    $option.html(roomname);
    $('#roomSelect').append($option);
    app.roomName = roomname;

  },
  addFriend: function(friend){
    console.log('addFriend called');
    if(app.friends.indexOf(friend) === -1){
      app.friends.push(friend);
      $friend = $('<a href="#" class="friend">' + friend + '</a><br>');
      $('#friends').append($friend);
    }
    console.log('friend:' + friend);
  },
  handleSubmit: function(){
    var text = $('input').val().trim();
    //clear the textbox
    $('input').val('');
    var roomName = app.roomName;
    var message = new Message(app.userName, text, roomName);
    app.send(message);
  },
  userName: undefined,
  rooms: [],
  friends: [],
  roomName: 'HRR9',
};
//creates new message
var Message = function(username, text, roomName){
  this.username = username;
  this.text = text;
  this.roomname = roomName;
};
// escpaping function
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
