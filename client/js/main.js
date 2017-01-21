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
const OFFSET_Y = canvasHeight / 2;

//Game stuff
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
    var ship;
    var shipSprite;

    function create () {
        createBackground();

        let gridWidth = 10,
            gridHeight = 5,
            movingDown = true,
            topCell = new HexPosition(0, 0, 0);

		for (let column = 0; column < gridWidth; column++) {
			let newCell = topCell.copy();
			for (let row = 0; row < gridHeight; row++) {
				let position2d = newCell.position2d();
				let pixels2d = position2dToPixels2(position2d.x, position2d.y);

				let cell = game.add.sprite(pixels2d.x, pixels2d.y, 'cell');
				cell.scale.setTo(SCALE);
				setAnchorMid(cell);
				newCell = newCell.move_towards(Orientation.D, 1);
			}

			topCell = movingDown ? topCell.move_towards(Orientation.DR, 1) : topCell.move_towards(Orientation.UR, 1);
			movingDown = !movingDown;
        }
		topCell.move_towards(Orientation.D);

		/*while(topCell.x <= max_dist){
			let newCell = topCell.copy();
			while(newCell.y > -max_dist){

				let position2d = newCell.position2d();
				let pixels2d = position2dToPixels2(position2d.x, position2d.y);

				let cell = game.add.sprite(pixels2d.x, pixels2d.y, 'cell');
				cell.scale.setTo(SCALE);
				setAnchorMid(cell);
				newCell = newCell.move_towards(Orientation.D,1);
			}
			topCell = topCell.move_towards(Orientation.DR,1);
		}*/

        //get position from server
        ship = new Ship(0, 0, 0);

        shipSprite = game.add.sprite(0, 0, 'playership');
        shipSprite.scale.setTo(SCALE);
    		setAnchorMid(shipSprite);
		cursors = game.input.keyboard.createCursorKeys();
        createUI();
    }

    function createBackground() {
      let background = [];
      for (i = 0; i <= window.innerWidth/32; ++i) {
          background[i] = [];
          for (j = 0; j <= window.innerHeight/32; ++j) {
              background[i][j] = game.add.sprite(32 * i, j * 32, 'beach')
              var frames = [];
              if (i % 3 == 0) {
                  frames = [496, 496, 498];
              } else if (i % 3 == 1) {
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
        var missile_border = game.add.sprite(canvasWidth - OFFSET_X, OFFSET_X, 'button');
        setAnchorMid(missile_border);
        missile_border.scale.setTo(SCALE);
        var missile = game.add.sprite(canvasWidth - OFFSET_X, OFFSET_X, 'misile_button');
        setAnchorMid(missile);
        missile.scale.setTo(SCALE);
    }


    function update () {

    	if (cursors.up.isDown)
        {
			socket.emit("move",Orientation.U);
			//ship.move_towards(Orientation.U)
            //ship.setOrientation(Orientation.U);
        }
        else if (cursors.right.isDown)
        {
			socket.emit("move",Orientation.UR);
            //ship.move_towards(Orientation.UR)
            //ship.setOrientation(Orientation.UR)
        }
        else if (cursors.left.isDown)
        {
			socket.emit("move",Orientation.DL);
            //ship.move_towards(Orientation.DL)
            //ship.setOrientation(Orientation.DL);
        }
		else if (cursors.down.isDown)
		{
			socket.emit("move",Orientation.D);
            //ship.move_towards(Orientation.D)
            //ship.setOrientation(Orientation.D);
		}


        //render players
        let player2dposition = ship.getPosition().position2d();
        let player_pixel_positions = position2dToPixels2(player2dposition.x, player2dposition.y);
        shipSprite.x = player_pixel_positions.x;
        shipSprite.y = player_pixel_positions.y;
        shipSprite.angle = (ship.getOrientation()-1)* 60;

    }

    function setAnchorMid(sprite) {
    	sprite.anchor.x = 0.5;
    	sprite.anchor.y = 0.5;
    }

    function hex2pixCoords(hex_x,hex_y) {
    	let pix_coords = {};
    	pix_coords.x = SCALE * Cell.WIDTH*0.75 * (hex_y + hex_x) + OFFSET_X;
    	pix_coords.y = SCALE * Cell.HEIGHT*0.5 * (-hex_x + hex_y) + OFFSET_Y;
    	return pix_coords;
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
            if (typeof players[p].sprite == "undefined"){
                if (players[p].team == "you"){
                    players[p].sprite = game.add.sprite(0, 0, 'playership');
                }
                else if (players[p].team == "enemy") {
                    players[p].sprite = game.add.sprite(0, 0, 'enemyship');
                }
                else {
                    players[p].sprite = game.add.sprite(0, 0, 'allyship');
                }
                setAnchorMid(players[p].sprite);
                players[p].sprite.scale.setTo(SCALE);
            }

            let player_hex_position = new HexPosition(players[p].position.x, players[p].position.y, players[p].position.z);
            let player_2d_position = player_hex_position.position2d();
            player_2d_position = position2dToPixels2(player_2d_position.x,player_2d_position.y);
            players[p].sprite.x = player_2d_position.x;
            players[p].sprite.y = player_2d_position.y;
        };
    }


// SOCKET CONNECTION STUFF

var socket = io.connect('/');
//Now we can listen for that event
socket.on('onconnected', function( data ) {
    //Note that the data is the object we sent from the server, as is. So we can assume its id exists.
    console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});

socket.on('gamestate', function( data ) {

    //console.log('Received game state', data);
    data.players.forEach( function (player) {
        let nick = player.nick;
        if (typeof players[nick] == "undefined") {
            players[nick] = {};
        }
        players[nick].team = player.team;
        players[nick].position = player.position;
        players[nick].orientation = player.orientation;
    });
    renderShips();
});

socket.on('disconnected', function (id) {
    console.log('Que covard! el ' + id + ' s\'ha desconnectat!');
});
