var socket = io.connect('/');
//Now we can listen for that event
socket.on('onconnected', function( data ) {
    //Note that the data is the object we sent from the server, as is. So we can assume its id exists.
    console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.id );
});

socket.on('gamestate', function( data ) {
	data.players.forEach()
});

availableWidth = window.innerWidth;
availableHeight = window.innerHeight;

var canvasHeight = availableHeight;
var canvasWidth = availableWidth;
if (availableWidth / availableHeight > 700 / 400) {
    canvasWidth = availableHeight * 700 / 400;
} else {
    canvasHeight = availableWidth * 400 / 700;
}

const SCALE = canvasWidth / 1400;
const OFFSET_X = 100 * SCALE;
const OFFSET_Y = canvasHeight / 2;

var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });

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
    var player;
    var ship;

    function create () {
        //createBackground();
        //get size from serverg
        let size_x = 7;
        let size_y = 7;
        var grid = new Grid(size_x,size_y);


        for (let i = 0; i < size_y; i++){
        	for (let j = 0; j < size_y; j++){
                let type = grid.getCell(i,j);
                if (type != -1) {
                    let coords = hex2pixCoords(i,j);
                    let cell = game.add.sprite(coords.x, coords.y, 'cell');
                    cell.scale.setTo(SCALE);
                    setAnchorMid(cell);
                }
        	}
        }

        //get position from server
        player = new Player(0,0);

        ship = game.add.sprite(0, 0, 'redship');
        ship.scale.setTo(SCALE);
    		setAnchorMid(ship);
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
    }


    function update () {

    	if (cursors.up.isDown)
        {
			socket.emit("move",Orientation.U);
			player.move_towards(Orientation.U)
			player.setOrientation(Orientation.U);
        }
        else if (cursors.right.isDown)
        {
			socket.emit("move",Orientation.UR);
			player.move_towards(Orientation.UR)
			player.setOrientation(Orientation.UR)
        }
        else if (cursors.left.isDown)
        {
			socket.emit("move",Orientation.DL);
			player.move_towards(Orientation.DL)
			player.setOrientation(Orientation.DL);
        }
		else if (cursors.down.isDown)
		{
			socket.emit("move",Orientation.D);
			player.move_towards(Orientation.D)
			player.setOrientation(Orientation.D);
		}


        //render players
        let player2dposition = player.getPosition().position2d();
        let player_pixel_positions = position2dToPixels2(player2dposition.x, player2dposition.y);
        ship.x = player_pixel_positions.x;
        ship.y = player_pixel_positions.y;
        ship.angle = (player.getOrientation()-1)* 60;

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
		pix_coords.x = SCALE *(Cell.HEIGHT * hex_x-20) +canvasWidth/2;
		pix_coords.y = SCALE *(Cell.HEIGHT * hex_y) + canvasHeight/2;
		return pix_coords;
    }
