const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 1400;
const OFFSET_X = 100;
const OFFSET_Y = CANVAS_HEIGHT/2;

var game = new Phaser.Game(CANVAS_WIDTH, CANVAS_HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });

    function preload () {

        game.load.image('cell', '../assets/hexagon_border.png');
        game.load.image('redship', '../assets/ship1.png');

        // TODO give attribution notice for Ivan Voirol : http://opengameart.org/content/basic-map-32x32-by-silver-iv
        game.load.spritesheet('beach', 'assets/beachmap.png', 32, 32);
    }

    var cursors;
    var player;
    var ship;

    function create () {
        //createBackground();
        //get size from server
        let size_x = 7;
        let size_y = 7;
        var grid = new Grid(size_x,size_y);


        for (let i = 0; i < size_y; i++){
        	for (let j = 0; j < size_y; j++){
                let type = grid.getCell(i,j);
                if (type != -1) {
                    let coords = position2dToPixels(i,j);
                    let cell = game.add.sprite(coords.x, coords.y, 'cell');
                    setAnchorMid(cell);
                }
        	}
        }

        //get position from server
        player = new Player(0,0);

        ship = game.add.sprite(0, 0, 'redship');
		setAnchorMid(ship);

		cursors = game.input.keyboard.createCursorKeys();
    }

    function createBackground() {
      let background = [];
      for (i = 0; i < CANVAS_WIDTH/32; ++i) {
                background[i] = [];
                for (j = 0; j < CANVAS_HEIGHT/32; ++j) {
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

    function update () {

    	if (cursors.up.isDown)
        {
            player.move_towards(Orientation.U);
			player.setOrientation(Orientation.U);
        }
        else if (cursors.right.isDown)
        {
			player.move_towards(Orientation.UR);
			player.setOrientation(Orientation.UR)
        }
        else if (cursors.left.isDown)
        {
			player.move_towards(Orientation.DL);
			player.setOrientation(Orientation.DL);
        }
		else if (cursors.down.isDown)
		{
			player.move_towards(Orientation.D);
			player.setOrientation(Orientation.D);
		}


        //render players
        let player2dposition = player.getPosition().position2d();
        console.log(player2dposition);
        let player_pixel_positions = position2dToPixels2(player2dposition.x, player2dposition.y);
        ship.x = player_pixel_positions.x;
        ship.y = player_pixel_positions.y;
        ship.angle = (player.getOrientation()-1)* 60;

    }

    function setAnchorMid(sprite) {
    	sprite.anchor.x = 0.5;
    	sprite.anchor.y = 0.5;
    }

    function position2dToPixels(hex_x,hex_y) {
    	let pix_coords = {};
    	pix_coords.x = Cell.WIDTH*0.75 * (hex_y + hex_x) + OFFSET_X;
    	pix_coords.y = Cell.HEIGHT*0.5 * (-hex_x + hex_y) + OFFSET_Y;
    	return pix_coords;
    }
    function position2dToPixels2(hex_x,hex_y){
		let pix_coords = {};
		pix_coords.x = Cell.HEIGHT * hex_x +CANVAS_WIDTH/2-20;
		pix_coords.y = Cell.HEIGHT * hex_y + CANVAS_HEIGHT/2;
		return pix_coords;
    }