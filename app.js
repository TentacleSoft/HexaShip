"use strict";

const WAITFORMOVES = 0;
const MOVING = 1;

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

    players[socket.id] = new Player(new Ship(0, 0, 0), socket);

    socket.emit('onconnected', {id: socket.id});

    socket.on('move', function (orientation) {
        if (status == WAITFORMOVES){
            players[socket.id].orders.push({type: 'move', orientation: orientation});
        }
    });

    socket.on('shoot', function (orientation) {
        if (status == WAITFORMOVES){
		  players[socket.id].orders.push({type: 'shoot', orientation: orientation});
        }

    });

    socket.on('disconnect', function () {
        console.log('Disconnected: ' + socket.id);
        delete players[socket.id];

        for (var id in players) {
            players[id].socket.emit('disconnected', socket.id);
        }
    });
});

const turnDuration = 5;
const stepsPerTurn = 3;

var status = WAITFORMOVES;

var turn = function () {
    status = MOVING;
    for (var step = 0; step < stepsPerTurn; step++) { // TODO use OrderQueue.size
        setTimeout(function (step) {
            for (var i in players) {
                var player = players[i];
                if(player.ship.status != 'sunk'){
					player.ship.status = 'alive';
					player.ship.shoot_orientation = '';
                }
                var order = player.orders.pop();
                if (typeof order !== "undefined") {
                    processOrder(i, order);
                }
            }
        sendGameState(step);
        if (step == 2) {
            status = WAITFORMOVES;
            notifyTurnStart();
        }
        }, step * 1000, step);
    }
};

function notifyTurnStart() {
    for (var id in players) {
        players[id].socket.emit("turn_start", turnDuration);
    }
}

function processOrder(playerId, order) {
    if(players[playerId].ship.status == "sunk"){
        return;
    }
	var ships = [];
	for (var id in players) {
		ships.push(players[id].ship);
	}
    switch (order.type) {
        case 'move':
            // TODO validate orientation and movement
            players[playerId].ship.move_towards(order.orientation,ships);
            break;
        case 'shoot':
			players[playerId].ship.shoot(order.orientation, ships);
            break;
        default:
            console.log('Undefined order type', order);
            break;
    }
}

var sendGameState = function (step) {
    for (var i in players) {
        var gamestate = {players: []};
        for (var j in players) {
            var player = players[j];
            gamestate.players.push({
                id: player.socket.id,
                nick: 'Cacatua ' + player.socket.id,
                orientation: player.ship.orientation,
                position: player.ship.position,
				status: player.ship.status,
				health: player.ship.health,
                shoot_orientation: player.ship.shoot_orientation,
                team: i === player.socket.id ? 'you' : 'enemy'
            });
        }
        gamestate.step = step;
        players[i].socket.emit("gamestate", gamestate);
    }
};

setInterval(turn, (turnDuration + stepsPerTurn - 1) * 1000);
