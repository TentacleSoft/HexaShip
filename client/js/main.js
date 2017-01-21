availableWidth = window.innerWidth;
availableHeight = window.innerHeight;

var canvasRatio = 1;
var canvasHeight = availableHeight;
var canvasWidth = availableWidth;
if (availableWidth / availableHeight > canvasRatio) {
    canvasWidth = availableHeight * canvasRatio;
} else {
    canvasHeight = availableWidth * (1/canvasRatio);
}

const SCALE = canvasWidth / 900;
const OFFSET_X = 100 * SCALE;

//Game stuff
var socket;
var players = {};
var game = new Phaser.Game(availableWidth, availableHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });


    function preload () {
        //game assets
        game.load.image('cell', '../assets/hexagon_border_blue.png');
        game.load.image('enemyship', '../assets/enemyship.png');
        game.load.image('allyship', '../assets/allyship.png');
        game.load.image('playership', '../assets/playership.png');

        //UI assets
        game.load.image('button', '../assets/button.png');
        game.load.image('button_pressed', '../assets/button_pressed.png');
        game.load.image('misile_button', '../assets/misile_button.png');

        // TODO give attribution notice for Ivan Voirol : http://opengameart.org/content/basic-map-32x32-by-silver-iv
        game.load.spritesheet('beach', 'assets/beachmap.png', 32, 32);
    }

    var cursors;
    var grid;

    //groups
    var sprites;


    function create () {
        createSpriteGroups();
        createBackground();
        createFuckingGrid();
		cursors = game.input.keyboard.createCursorKeys();
        createUI();
        createConnection();
    }

    function createSpriteGroups() {
        let background = game.add.group();
        let grid = game.add.group();
        let ships = game.add.group();
        let ui = game.add.group();

        sprites = {};
        sprites.background = background;
        sprites.grid = grid;
        sprites.ships = ships;
        sprites.ui = ui;
    }

    function createFuckingGrid() {
        grid = {} ;
        let gridWidth = 10,
            gridHeight = 5,
            movingDown = true,
            topCell = new HexPosition(0, 0, 0);

        for (let column = 0; column < gridWidth; column++) {
            let newCell = topCell.copy();
            for (let row = 0; row < gridHeight; row++) {
                let position2d = newCell.position2d();
                let pixels2d = position2dToPixels2(position2d.x, position2d.y);

                let cell = sprites.grid.create(pixels2d.x, pixels2d.y, 'cell');
                cell.scale.setTo(SCALE);
                setAnchorMid(cell);
                addSpriteToGrid(grid, newCell.x, newCell.y, newCell.z, cell);
                newCell = newCell.move_towards(Orientation.D, 1);
            }

            topCell = movingDown ? topCell.move_towards(Orientation.DR, 1) : topCell.move_towards(Orientation.UR, 1);
            movingDown = !movingDown;
        }
    }

    function addSpriteToGrid(grid,x,y,z,sprite){
        if (typeof grid[x] == "undefined") {
            grid[x] = {};
        }
        if (typeof grid[x][y] == "undefined") {
            grid[x][y] = {};
        }
        grid[x][y][z] = sprite;

    }

    function createBackground() {
      let background = [];
      for (i = 0; i <= window.innerWidth/32; ++i) {
          background[i] = [];
          for (j = 0; j <= window.innerHeight/32; ++j) {
              background[i][j] = sprites.background.create(32 * i, j * 32, 'beach')
              let frames = [];
              if (i % 3 === 0) {
                  frames = [496, 496, 498];
              } else if (i % 3 === 1) {
                  frames = [496, 498, 496];
              } else {
                  frames = [498, 496, 496];
              }
              background[i][j].animations.add('water', frames, 0.5, true);
              background[i][j].animations.play('water');
          }
      }
    }

    function createUI() {
        var missile_border = sprites.ui.create(canvasWidth - OFFSET_X, OFFSET_X, 'button');
        setAnchorMid(missile_border);
        missile_border.scale.setTo(SCALE);
        var missile = sprites.ui.create(canvasWidth - OFFSET_X, OFFSET_X, 'misile_button');
        setAnchorMid(missile);
        missile.scale.setTo(SCALE);
    }


        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }


        function update () {
        let timeToSleep = 500;
    	if (cursors.up.isDown) {
			socket.emit("move",Orientation.U);
        } else if (cursors.right.isDown) {
			socket.emit("move",Orientation.UR);
        } else if (cursors.left.isDown) {
			socket.emit("move",Orientation.DL);
        } else if (cursors.down.isDown) {
			socket.emit("move",Orientation.D);
		}else{
    	    time_to_sleep = 0
        }
        sleep(500);

    }

    function setAnchorMid(sprite) {
    	sprite.anchor.x = 0.5;
    	sprite.anchor.y = 0.5;
    }

    function position2dToPixels2(hex_x,hex_y){
		let pix_coords = {},
            offset = 50;
		pix_coords.x = SCALE * (Cell.HEIGHT * hex_x) + 50 * SCALE + offset;
		pix_coords.y = SCALE * (Cell.HEIGHT * hex_y) + 50 * SCALE + offset;
		return pix_coords;
    }

    function renderShips() {
        for (let p in players) {
            if (typeof players[p].sprite === "undefined"){
                if (players[p].team === "you"){
                    players[p].sprite = sprites.ships.create(0, 0, 'playership');
                }
                else if (players[p].team === "enemy") {
                    players[p].sprite = sprites.ships.create(0, 0, 'enemyship');
                }
                else {
                    players[p].sprite = sprites.ships.create(0, 0, 'allyship');
                }
                setAnchorMid(players[p].sprite);
                players[p].sprite.scale.setTo(SCALE);
            }

            let player_hex_position = new HexPosition(players[p].position.x, players[p].position.y, players[p].position.z);
            let player_2d_position = player_hex_position.position2d();
            player_2d_position = position2dToPixels2(player_2d_position.x,player_2d_position.y);
            players[p].sprite.x = player_2d_position.x;
            players[p].sprite.y = player_2d_position.y;

            players[p].sprite.angle = (players[p].orientation - 1) * 60;
        };
    }


function createConnection() {
    socket = io.connect('/');
    //Now we can listen for that event
    socket.on('onconnected', function (data) {
        //Note that the data is the object we sent from the server, as is. So we can assume its id exists.
        console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);
    });

    socket.on('gamestate', function (data) {

        //console.log('Received game state', data);
        data.players.forEach(function (player) {
            let socketId = player.id;
            if (typeof players[socketId] === "undefined") {
                players[socketId] = {};
            }
            players[socketId].team = player.team;
            players[socketId].position = player.position;
            players[socketId].orientation = player.orientation;
        });
        renderShips();
    });

    socket.on('disconnected', function (id) {
        console.log('Que covard! el ' + id + ' s\'ha desconnectat!');
        players[id].sprite.destroy();
        delete players[id];
    });
}