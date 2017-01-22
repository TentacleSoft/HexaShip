"use strict";

var Player = require("./server/player"),
    HexPositions = require("./client/js/objects/hexpositions"),
    HexPosition = HexPositions.position,
    Ship = require("./server/server_ship"),
    OrderQueue = require("./server/order_queue");

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
        players[socket.id].orders.push({type: 'move', orientation: orientation});
    });

    socket.on('shoot', function () {
        var ships = [];
        for (var id in players) {
            ships.push(players[id].ship);
        }

        players[socket.id].ship.shoot(orientation, ships);
    });

    socket.on('disconnect', function () {
        console.log('Disconnected: ' + socket.id);
        delete players[socket.id];

        for (var id in players) {
            players[id].socket.emit('disconnected', socket.id);
        }
    });
});

const turnDuration = 10;

var turn = function () {
    notifyTurnStart();

    for (var step = 0; step < 3; step++) { // TODO use OrderQueue.size
        setTimeout(function () {
            for (var i in players) {
                var player = players[i];

                var order = player.orders.pop();
                if (typeof order !== "undefined") {
                    processOrder(i, order);
                }
            }
        }, step * 1000);
    }
};

function notifyTurnStart() {
    for (var id in players) {
        players[id].socket.emit("turn_start", turnDuration);
    }
}

function processOrder(playerId, order) {
    switch (order.type) {
        case 'move':
            // TODO validate orientation and movement
            players[playerId].ship.move_towards(order.orientation);
            players[playerId].ship.setOrientation(order.orientation);
        case 'shoot':
            console.log('TODO process shoot order');
        default:
            console.log('Undefined order type', order);
    }
}

var sendGameState = function () {
    for (var i in players) {
        var gamestate = {players: []};
        for (var j in players) {
            var player = players[j];
            gamestate.players.push({
                id: player.socket.id,
                nick: 'Cacatua ' + player.socket.id,
                orientation: player.ship.orientation,
                position: player.ship.position,
                team: i === player.socket.id ? 'you' : 'enemy'
            });
        }

        players[i].socket.emit("gamestate", gamestate);
    }
};

setInterval(turn, turnDuration * 1000);
setInterval(sendGameState, 1000);
