import { HexPosition } from './core/hex_position';
import { Orientation } from './core/orientation';
import { Player } from './server/player';
import { Ship, ShipStatus } from './core/ship';
import * as socketIo from 'socket.io';
import * as express from 'express';
import * as http from 'http';

export namespace HexaShip {
    enum Status {
        WAITFORMOVES = 1,
        MOVING
    }

    var port = process.env.PORT || 3000,
        app = express(),
        server = http.createServer(app),
        io = socketIo.listen(server);

    server.listen(port);
    console.log("Listening to http://localhost:" + port);

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    // Static files
    // TODO restrict access to server files?
    app.get('/*', function (req, res) {
        var file = req.params[0];
        res.sendFile(__dirname + '/' + file);
    });

    interface Players {
        [id: string]: Player;
    }
    var players: { [id: string]: Player } = {};
    var status: Status = Status.WAITFORMOVES;

    // get random number between min (included) and max (excluded)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    io.on('connection', function (socket) {
        console.log('Connected: ' + socket.id);

        var topCellX = getRandomInt(0, 9 + 1);
        var topCellY = 0;
        var topCellZ = 0;
        if (topCellX % 2 === 1) {
            topCellY = -(topCellX + 1) / 2;
            topCellZ = -(topCellX - 1) / 2;
        } else {
            topCellY = -topCellX / 2;
            topCellZ = -topCellX / 2;
        }

        var topCell = new HexPosition(topCellX, topCellY, topCellZ);
        var resultingPosition = topCell.move_towards(Orientation.D, getRandomInt(0, 4 + 1));
        // MAX WIDTH and MAX HEIGHT are hardcoded here as 9 and 4

        players[socket.id] = new Player(
            new Ship(resultingPosition.x, resultingPosition.y, resultingPosition.z, Orientation.D),
            socket
        );

        socket.emit('onconnected', { id: socket.id });

        socket.on('move', function (orientation) {
            if (status == Status.WAITFORMOVES) {
                players[socket.id].orders.push({ type: 'move', orientation: orientation });
            }
        });

        socket.on('shoot', function (orientation) {
            if (status == Status.WAITFORMOVES) {
                players[socket.id].orders.push({ type: 'shoot', orientation: orientation });
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

    var turn = function () {
        status = Status.MOVING;
        for (var step = 0; step < stepsPerTurn; step++) { // TODO use OrderQueue.size
            setTimeout(function (step) {
                for (var i in players) {
                    var player = players[i];

                    if (player.ship.status != ShipStatus.Sunk) {
                        player.ship.status = ShipStatus.Alive;
                        player.ship.shootOrientation = Orientation.None;
                    }

                    var order = player.orders.pop();
                    if (typeof order !== "undefined") {
                        processOrder(i, order);
                    }
                }
                sendGameState(step);
                if (step == 2) {
                    status = Status.WAITFORMOVES;
                }
            }, step * 1000, step);
        }

        //after send all steps, send a signal to start animations
        setTimeout(function () {
            notifyTurnStart();
        }, step * 1000);
    };

    function notifyTurnStart() {
        for (var id in players) {
            players[id].socket.emit("turn_start", turnDuration);
        }
    }

    function processOrder(playerId, order) {
        if (players[playerId].ship.status == ShipStatus.Sunk) {
            return;
        }

        var ships = [];
        for (var id in players) {
            ships.push(players[id].ship);
        }
        switch (order.type) {
            case 'move':
                // TODO validate orientation and movement
                players[playerId].ship.move_towards(order.orientation, ships);
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
            var gamestate: { step: number, players: Object[] } = {
                step: 0,
                players: []
            };
            for (var j in players) {
                var player = players[j];
                gamestate.players.push({
                    id: player.socket.id,
                    nick: 'Cacatua ' + player.socket.id,
                    orientation: player.ship.orientation,
                    shoot_orientation: player.ship.shootOrientation,
                    position: player.ship.position,
                    status: player.ship.status,
                    health: player.ship.health,
                    team: i === player.socket.id ? 'you' : 'enemy'
                });
            }
            gamestate.step = step;
            players[i].socket.emit("gamestate", gamestate);
        }
    };

    setInterval(turn, (turnDuration + stepsPerTurn) * 1000);

}