var socket = io.connect('/');
//Now we can listen for that event
socket.on('onconnected', function( data ) {
    //Note that the data is the object we sent from the server, as is. So we can assume its id exists.
    console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});

socket.on('gamestate', function( data ) {
    console.log('Received game state', data);
	// data.players.forEach()
});

availableWidth = window.innerWidth;
availableHeight = window.innerHeight;

var canvasRatio = 700 / 400;
var canvasHeight = availableHeight;
var canvasWidth = availableWidth;
if (availableWidth / availableHeight > canvasRatio) {
    canvasWidth = availableHeight * canvasRatio;
} else {
    canvasHeight = availableWidth * (1/canvasRatio);
}

const SCALE = canvasWidth / 1400;
const OFFSET_X = 100 * SCALE;
const OFFSET_Y = canvasHeight / 2;

var game = new Phaser.Game(availableWidth, availableHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });

    function preload () {

        //game assets
        game.load.image('cell', '../assets/hexagon_border.png');
        game.load.image('redship', '../assets/ship1.png');

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
        //createBackground();

		var max_dist = 4;
		var topCell = new HexPosition(-max_dist,max_dist,0);
		while(topCell.x < 0){
			let newCell = topCell.copy();
			while(newCell.z < max_dist){

				let position2d = newCell.position2d();
				let pixels2d = position2dToPixels2(position2d.x, position2d.y);

				let cell = game.add.sprite(pixels2d.x, pixels2d.y, 'cell');
				cell.scale.setTo(SCALE);
				setAnchorMid(cell);
				newCell = newCell.move_towards(Orientation.D,1);
			}
			topCell = topCell.move_towards(Orientation.UR,1);
		}
		topCell.move_towards(Orientation.D);

		while(topCell.x <= max_dist){
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
		}

        //get position from server
        ship = new Ship(0, 0, 0);

        shipSprite = game.add.sprite(0, 0, 'redship');
        shipSprite.scale.setTo(SCALE);
    		setAnchorMid(shipSprite);
		cursors = game.input.keyboard.createCursorKeys();
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
		let pix_coords = {};
		pix_coords.x = SCALE *(Cell.HEIGHT * hex_x) +canvasWidth/2;
		pix_coords.y = SCALE *(Cell.HEIGHT * hex_y) + canvasHeight/2;
		return pix_coords;
    }
