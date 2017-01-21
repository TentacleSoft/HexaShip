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

io.on('connection',function (socket) {
    console.log('Connected: ' + socket.id);
    players[socket.id] = new Player (socket);

    /*socket.emit('logged', socket.id);

    updatePlayers();

    socket.on('keyChanged', function (key) {
        players[socket.id].direction[key.key] = key.value;
        movingPlayer(socket.id);
    });

    socket.on('shoot', function (coord) {
        shoots.push(new Shoot(players[socket.id].x,players[socket.id].y,coord.x,coord.y,socket.id));
        sendingShoots();
    });*/

});
