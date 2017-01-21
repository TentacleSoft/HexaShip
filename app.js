"use strict";

var Player = require("./client/js/objects/player"),
    HexPosition = require("./client/js/objects/hexpositions");

var port = process.env.PORT || 3000,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(port);
console.log("Listening to http://localhost:" + port);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

// Static files
app.get('/*', function (req, res, next) {
    var file = req.params[0];

    res.sendFile(__dirname + '/client/' + file);
});

var players = [];

io.on('connection',function (socket) {
    console.log('Connected: ' + socket.id);
    // players[socket.id] = new Player (socket);

    players.push(new Player(new HexPosition(0, 0, 0), socket));

    socket.emit('onconnected', {id: socket.id});

    socket.on('move', function (data) {
        // TODO
        // console.log('Player ' + socket.id + ' wants to move to ' + data.direction);
    });

    /*updatePlayers();

    socket.on('keyChanged', function (key) {
        players[socket.id].direction[key.key] = key.value;
        movingPlayer(socket.id);
    });

    socket.on('shoot', function (coord) {
        shoots.push(new Shoot(players[socket.id].x,players[socket.id].y,coord.x,coord.y,socket.id));
        sendingShoots();
    });*/

});

var sendTurn = function () {
    /*for (var i = 0; i < players.length; i++) {
        players[i].socket.emit('gamestate', {players: players});
    }*/
};

setInterval(sendTurn, 1000);
