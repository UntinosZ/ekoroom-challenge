'use strict';
let numUsers = 0;
let userList = [];

const _socket = (socket) => {

  let addedUser = false;

  socket.broadcast.emit('init', {
    numUsers: numUsers,
    userList: userList
  })

  socket.emit('init', {
    numUsers: numUsers,
    userList: userList
  })


  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;

    if (userList.indexOf(username) < 0) {
      userList.push(username);
      ++numUsers;
      addedUser = true;
    }

    socket.emit('init', {
      username: socket.username,
      numUsers: numUsers,
      userList: userList
    });

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      numUsers: numUsers,
      userList: userList
    });


  });

  socket.on('user logout', (data) => {
    console.log(data);
    let userRow = userList.indexOf(data.username);
    if (userRow > 0) {
      userList.splice(userRow, 1);
      --numUsers;
      socket.broadcast.emit('init', {
        numUsers: numUsers,
        userList: userList
      })
    }
  })

  socket.on('disconnect', () => {
    console.log(socket.username);
    if (addedUser) {
      let userRow = userList.indexOf(socket.username);
      if (userRow > 0) {
        userList.splice(userRow, 1);
        --numUsers;
      }
      console.log(numUsers, userList);
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers,
        userList: userList
      });
    }
  });

}

module.exports = _socket;