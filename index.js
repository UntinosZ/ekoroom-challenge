'use strict';

const express = require('express');
const http = require('http');
const socket = require('./routes/socket');
const app = express();
const server = http.createServer(app);

/* Configuration */
app.use(express.static(__dirname + '/public'));
app.set('port', 3000);

if (process.env.NODE_ENV === 'development') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/* Socket.io Communication */
const io = require('socket.io').listen(server);
io.on('connection', socket);

/* Start server */
server.listen(app.get('port'), function (){
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;