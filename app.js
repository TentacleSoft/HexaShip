"use strict";

var Player = require("./client/js/objects/player"),
    HexPositions = require("./client/js/objects/hexpositions"),
    HexPosition = HexPositions.position,
    Ship = require("./server_ship");

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

var players = {};

io.on('connection',function (socket) {
    console.log('Connected: ' + socket.id);
    // players[socket.id] = new Player (socket);

    players[socket.id] = new Player(new Ship(0, 0, 0), socket);

    socket.emit('onconnected', {id: socket.id});

    socket.on('move', function (orientation) {
        players[socket.id].ship.move_towards(orientation);
        players[socket.id].ship.setOrientation(orientation);
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

    socket.on('disconnect', function () {
        console.log('Disconnected: ' + socket.id);
        delete players[socket.id];
    });
});

var sendTurn = function () {
    for (var i in players) {
        var gamestate = {players: []};
        for (var j in players) {
            var player = players[j];
            gamestate.players.push({
                nick: 'Cacatua ' + player.socket.id,
                orientation: player.ship.orientation,
                position: player.ship.position,
                team: i === player.socket.id ? 'you' : 'enemy'
            });
        }

        players[i].socket.emit("gamestate", gamestate);
    }
};

setInterval(sendTurn, 1000);
