'use strict';
$(function(){

  var $username;

  var addChatMessage = function (data) {
    var html = `
      <li class=${data.username == $username ? "i": "friend-with-a-SVAGina"}>
        <div class="head">
          <span class="time"> ${new Date().toLocaleString()}</span>
          <span class="name">${data.username}</span>
        </div>
        <div class="message">"${data.message}"</div>
      </li>`;
    $('.messages').append(html);

  }

  var addUserList = function (data) {
    var html = `
      <li data-username="${data.username}">
        <img width="50" height="50" src="/images/avatar.jpg">
        <div class="info">
          <div class="user">${data.username}</div>
          <div class="status on"> online</div>
        </div>
      </li>
    `;
    $('.list-friends').append(html);
  }

  var resetChatRoom = function(data) {
    $('.list-friends').find('li').remove();
    $('.messages').find('li').remove();

    updateUserCount({numUsers:0});
    userLogut();
  }

  var userOnline = function (data) {

    var offlineUser = $('.list-friends').find('li[data-username="'+ data.username +'"]');
    if (offlineUser.length > 0) {
      offlineUser.find('.status').removeClass('off').addClass('on').text('online') 
    }else{
      addUserList(data);
    }
  }

  var userOffline = function (data) {
    var offlineUser = $('.list-friends').find('li[data-username="'+ data.username +'"]');
    offlineUser.find('.status').removeClass('on').addClass('off').text('offline')
  }

  var userLogut = function () {
    sessionStorage.removeItem('username');
    $username = null;
    openLoginPage();
  }

  var updateUserCount = function (data) {
    $('#profile .count').text('User Online: '+ data.numUsers)
  }

  var updateUserList = function (data) {
    if (data.userList.length == 0) {
      resetChatRoom()
    }else{
      $('.list-friends').find('li').remove();
      for (var i = 0; i < data.userList.length; i++) {
        userOnline({username: data.userList[i]})
      };
    }
  }



  var submitMessage = function (message) {
    let data = {
      username: $username,
      message: message
    }
    addChatMessage(data);
    socket.emit('new message', data);
    clearResizeScroll();
  }

  var clearResizeScroll = function() {
    $("#message-box").val("");
    $(".messages").getNiceScroll(0).resize();
    return $(".messages").getNiceScroll(0).doScrollTop(999999, 999);
  };

  //Login Page
  var closeLoginPage = function () {
    $('.login-page').addClass('close');
    $('.login-page').removeClass('open');
  }

  var openLoginPage = function () {
    $('.login-page').addClass('open')
    $('.login-page').removeClass('close');
  }

  //User
  var userLogin = function (username) {
    socket.emit('add user', username);
    $username = username;
    $('#profile .info .name').text(username)
    addSessionUser(username)
    closeLoginPage();
  }

  //Session
  var addSessionUser = function (username) {
    sessionStorage.setItem('username', username);
  }

  var getSessionUser = function () {
    return sessionStorage.getItem('username');
  }

  //Event Listener
  $('#message-box').on('keypress', function(e) {
    if (e.keyCode === 13) {
      var innerText = $.trim($("#message-box").val());
      submitMessage(innerText)
      return false;
    }
  })

  $('#username').on('keypress', function(e) {
    if (e.keyCode === 13) {
      var username = $.trim($("#username").val());
      if (username != "") {
        userLogin(username)
        return false;
      }else{
        alert("Tell your name please.")
        return true;
      }
    }    
  })

  $('.login-submit').on('click', function(e) {
    var username = $.trim($("#username").val());
    if (username != "") {
      userLogin(username)
      return false;
    }else{
      alert("Tell your name please.")
      return true;
    }
  })

  $('.logout-icon').on('click', function(e) {
    if (confirm('You want to exit chat ?')){
      socket.emit('user logout', {username: $username});
      userLogut();
    }else{
      return false;
    }
  })

  //Socket
  var socket = io();

  socket.on('init', function (data) {
    updateUserList(data);
    updateUserCount(data);
    clearResizeScroll();
  });

  socket.on('new message', function (data) {
    addChatMessage(data);
    clearResizeScroll();
  });

  socket.on('user joined', function (data) {
    updateUserList(data);
    updateUserCount(data);
    clearResizeScroll();
  });

  socket.on('login', function (data) {
    clearResizeScroll();
  })

  socket.on('user left', function (data) {
    updateUserList(data);
    updateUserCount(data);
    clearResizeScroll();
  })

  if ($username = getSessionUser()) {
    userLogin($username)
    closeLoginPage();
  };

});