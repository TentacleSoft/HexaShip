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

const blueCellColor = 0x0000ff;
const redCellColor = 0xff0000;
const validMoveColor = 0x77ff77;
const gridWidth = 10;
const gridHeight = 5;

//Game stuff
var socket;
var maxActionsPerTurn = 3;
var actionsDone = 0;
var players = {};
var ship;
var predictionShip = null;

const MOVING = 0;
const WAITFORMOVES = 1;
const WAITFORATTACK = 2;

var game_status = WAITFORMOVES;

var validMoves = {};
var attackHex2Dir = {};
var attackDir2Hex = {};

var attackedTiles = [];

var game = new Phaser.Game(availableWidth, availableHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });


    function preload () {
        //game assets
        game.load.image('cell', '../assets/hexagon_border_white.png');
        game.load.image('enemyship', '../assets/enemyship.png');
        game.load.image('allyship', '../assets/allyship.png');
        game.load.image('playership', '../assets/playership.png');

        //UI assets
        game.load.image('button', '../assets/button.png');
        game.load.image('button_pressed', '../assets/button_pressed.png');
        game.load.image('misile_button', '../assets/misile_button.png');

        // TODO give attribution notice for Ivan Voirol : http://opengameart.org/content/basic-map-32x32-by-silver-iv
        game.load.spritesheet('beach', 'assets/beachmap.png', 32, 32);

        // TODO give attribution http://www.dafont.com/upheaval.font
        game.load.bitmapFont('font', 'assets/bitmapFonts/font.png', 'assets/bitmapFonts/font.fnt');

        // TODO give attribution https://www.freesound.org/people/baefild/sounds/91293/
        game.load.audio('cannon', ['assets/sound/cannon.mp3']);
        // TODO attribute https://www.freesound.org/people/LXX.70/sounds/91071/
        game.load.audio('ambiance', ['assets/sound/ambiance.mp3']);
    }

    var cursors;
    var grid;

    //groups
    var sprites;


    function create () {
        createSpriteGroups();

        let background = game.add.audio('ambiance');
        background.play();

        createBackground();
        createFuckingGrid();
		cursors = game.input.keyboard.createCursorKeys();
        createUI();
        createConnection();

        game.input.onTap.add(function(){
            selectTile() }, this );
    }

    function selectTile() {
        let hexClick = pixelstoHexPosition(game.input.x,game.input.y);
        if (predictionShip !== null){
            if (game_status == WAITFORMOVES) {
                if (typeof validMoves[hexClick.x] != "undefined" &&
                    typeof validMoves[hexClick.x][hexClick.y] != "undefined" &&
                    typeof validMoves[hexClick.x][hexClick.y][hexClick.z] != "undefined"){
                        let orientation = predictionShip.position.straight_orientation_to(hexClick);
                        predictionShip.move_towards(orientation);
                        drawPredictionShip();
                        socket.emit("move", orientation);
                        addActionDone();
                        calcPredictionValidMoves();
                }
            }
            else if (game_status == WAITFORATTACK) {
                if (typeof attackHex2Dir[hexClick.x] != "undefined" &&
                    typeof attackHex2Dir[hexClick.x][hexClick.y] != "undefined" &&
                    typeof attackHex2Dir[hexClick.x][hexClick.y][hexClick.z] != "undefined"){
                    socket.emit("shoot",attackHex2Dir[hexClick.x][hexClick.y][hexClick.z]);
                    addActionDone();
                    calcPredictionValidMoves();
                    game_status = WAITFORMOVES;
                }
            }
        }
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
        let movingDown = true,
            topCell = new HexPosition(0, 0, 0);

        for (let column = 0; column < gridWidth; column++) {
            let newCell = topCell.copy();
            for (let row = 0; row < gridHeight; row++) {
                let position2d = newCell.position2d();
                let pixels2d = position2DToPixels(position2d.x, position2d.y);

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

    function makeFuckingGridBlueAgain() {
        for (let i in grid) {
            let gridi = grid[i];
            for (let j in gridi){
                let gridj = gridi[j];
                for (let k in gridj) {
                    gridj[k].tint = blueCellColor;
                    gridj[k].alpha = 0.75;
                }
            }
        }
        for (let i = 0; i < attackedTiles.length; i++) {
            let pos = attackedTiles[i];
            grid[pos.x][pos.y][pos.z].tint = redCellColor;
            grid[pos.x][pos.y][pos.z].alpha = 1;
        }
        if (game_status == WAITFORMOVES){
            showValidMoves();
        }
        if (game_status == WAITFORATTACK){
            showAttackTiles();
        }
    }


    function showValidMoves(){
        if (predictionShip !== null && canActionBeDone()) {
            let greenTiles = predictionShip.get_valid_moves();
            for (let i = 0; i < greenTiles.length; i++) {
                grid[greenTiles[i].x][greenTiles[i].y][greenTiles[i].z].tint = validMoveColor;
            }
        }
    }
    function showAttackTiles(){
        if (predictionShip !== null && canActionBeDone()) {
            for (dir in attackDir2Hex) {
                for (let i = 0; i<attackDir2Hex[dir][0].length; i++){
                    grid[attackDir2Hex[dir][0][i].x][attackDir2Hex[dir][0][i].y][attackDir2Hex[dir][0][i].z].tint = redCellColor;
                }
            }
        }
    }

    function calcAttackTiles() {
        game.sound.play('cannon');

        if (predictionShip !== null) {


            //this works with magic
            attackDir2Hex = {};
            //left 1
            attackDir2Hex[turn_left(predictionShip.getOrientation(),1)] = predictionShip.getPosition().get_lines_from_orientations([turn_left(predictionShip.getOrientation(),1)],3);
            attackDir2Hex[turn_left(predictionShip.getOrientation(),2)] = predictionShip.getPosition().get_lines_from_orientations([turn_left(predictionShip.getOrientation(),2)],3);
            attackDir2Hex[turn_right(predictionShip.getOrientation(),1)] = predictionShip.getPosition().get_lines_from_orientations([turn_right(predictionShip.getOrientation(),1)],3);
            attackDir2Hex[turn_right(predictionShip.getOrientation(),2)] = predictionShip.getPosition().get_lines_from_orientations([turn_right(predictionShip.getOrientation(),2)],3);

            calcAttackHex2Dir(turn_left(predictionShip.getOrientation(),1));
            calcAttackHex2Dir(turn_left(predictionShip.getOrientation(),2));
            calcAttackHex2Dir(turn_right(predictionShip.getOrientation(),1));
            calcAttackHex2Dir(turn_right(predictionShip.getOrientation(),2));
        }

        //socket.emit("shoot",turn_left(player.orientation));
        //socket.emit("shoot",turn_right(player.orientation));
    }

    function calcAttackHex2Dir(orientation) {
        let valid = attackDir2Hex[orientation][0]
        for (let i = 0; i < valid.length; i++){
            if (typeof attackHex2Dir[valid[i].x] == "undefined") {
                    attackHex2Dir[valid[i].x] = {};
                }
                if (typeof attackHex2Dir[valid[i].x][valid[i].y] == "undefined") {
                    attackHex2Dir[valid[i].x][valid[i].y] = {};
                }
                attackHex2Dir[valid[i].x][valid[i].y][valid[i].z] = orientation;
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

    var timer;
    var actionsLeftText;
    function createUI() {
        var missile_border = sprites.ui.create(canvasWidth - OFFSET_X, OFFSET_X, 'button');
        setAnchorMid(missile_border);
        missile_border.scale.setTo(SCALE);
        var missile = sprites.ui.create(canvasWidth - OFFSET_X, OFFSET_X, 'misile_button');
        setAnchorMid(missile);
        missile.scale.setTo(SCALE);

        missile_border.inputEnabled = true;
        missile_border.input.useHandCursor = true;
        missile_border.events.onInputDown.add(onClickAttack, this);

        missile.inputEnabled = true;
        missile.input.useHandCursor = true;
        missile.events.onInputDown.add(onClickAttack, this);

        let maxWidth = availableWidth;
        timer = new Timer(maxWidth, 0, 0);

        actionsLeftText = game.add.bitmapText(canvasWidth - OFFSET_X + 250 * SCALE, OFFSET_X, 'font','Accions restants: 99999', 32);

        graphics = game.add.graphics(0, 0);
    }

    function onClickAttack() {
        if (game_status == WAITFORMOVES) {
            calcAttackTiles();
            game_status = WAITFORATTACK;
        }
        else if (game_status == WAITFORATTACK) {
            game_status = WAITFORMOVES;
        }
    }

    let currentKey = null;
    function update() {
        if (currentKey === null || !currentKey.isDown) {
            currentKey = null;
            let movementDone = true;
            if (cursors.up.isDown) {
                currentKey = cursors.up;
                socket.emit("move", Orientation.U);
            } else if (cursors.right.isDown) {
                currentKey = cursors.right;
                socket.emit("move", Orientation.UR);
            } else if (cursors.left.isDown) {
                currentKey = cursors.left;
                socket.emit("move", Orientation.DL);
            } else if (cursors.down.isDown) {
                currentKey = cursors.down;
                socket.emit("move", Orientation.D);
            } else {
                movementDone = false;
            }

            if (movementDone) {
                addActionDone();
            }
        }

        makeFuckingGridBlueAgain();
        graphics.clear();
        timer.render(graphics);

        let hexpos = pixelstoHexPosition(game.input.x,game.input.y);
        if(hexpos.within_box(gridWidth,gridHeight)){

			grid[hexpos.x][hexpos.y][hexpos.z].alpha = 1;
            if (game_status == WAITFORATTACK) {
                if (typeof attackHex2Dir[hexpos.x] != "undefined" &&
                    typeof attackHex2Dir[hexpos.x][hexpos.y] != "undefined" &&
                    typeof attackHex2Dir[hexpos.x][hexpos.y][hexpos.z] != "undefined" &&
                    typeof attackHex2Dir[hexpos.x][hexpos.y][hexpos.z][0] != "undefined"){
                    let dir = attackHex2Dir[hexpos.x][hexpos.y][hexpos.z];

                    for (let i = 0; i < attackDir2Hex[dir][0].length; i++){
                        let atPos = attackDir2Hex[dir][0][i];
                        grid[atPos.x][atPos.y][atPos.z].alpha = 1;
                    }
                }
            }
        }

        renderActionsLeft();

        for (let index in players) {
            let player = players[index];
            if (typeof player !== "undefined" && typeof player.health !== "undefined") {
                player.health.render(graphics);
            } else {
                console.log("health is undefined");
                console.log(player);
            }
        }
    }

    function setAnchorMid(sprite) {
    	sprite.anchor.x = 0.5;
    	sprite.anchor.y = 0.5;
    }

    function position2DToPixels(x,y){
		let pix_coords = {},
        offset = 50;
		pix_coords.x = SCALE * (Cell.HEIGHT * x) + 50 * SCALE + offset;
		pix_coords.y = SCALE * (Cell.HEIGHT * y) + 50 * SCALE + offset;
		return pix_coords;
    }

    function pixelstoHexPosition(px,py){
        let position2D = {},
        offset = 50;
		position2D.x = (px - 50 * SCALE - offset)/SCALE/Cell.HEIGHT;
		position2D.y = (py- 50 * SCALE - offset)/SCALE/Cell.HEIGHT;


		col = Math.round(position2D.x/0.866);
		x = col;
		let odd_offset = 0;
		if(x%2==1){
			odd_offset = - 0.5;
        }

		row = Math.round(position2D.y+odd_offset);


		z = row - (col - (col&1)) / 2;
		y = -x-z;
        return new HexPosition(x,y,z);
    }

    function renderShips() {
        attackedTiles = [];
        for (let p in players) {
            if( players[p].status == "shooting"){
                var position = new HexPosition(players[p].position.x,players[p].position.y,players[p].position.z);
                var atts = position.get_line_towards(players[p].shoot_orientation, 3);
                for (let i = 0; i < atts.length; i++){
                    attackedTiles.push(atts[i]);
                }
                //console.log("player is shooting towards "+players[p].shoot_orientation);
            }
            if (typeof players[p].sprite === "undefined" && players[p].status != "sunk"){
                if (players[p].team === "you" && players[p].status != "sunk"){
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

            if (players[p].status != "sunk") {
                let player_hex_position = new HexPosition(players[p].position.x, players[p].position.y, players[p].position.z);
                let player_2d_position = player_hex_position.position2d();
                player_2d_position = position2DToPixels(player_2d_position.x,player_2d_position.y);
                players[p].sprite.x = player_2d_position.x;
                players[p].sprite.y = player_2d_position.y;
                players[p].health.updatePosition(player_2d_position.x, player_2d_position.y);

                players[p].sprite.angle = (players[p].orientation - 1) * 60;
            }
            else if (typeof players[p].sprite !== "undefined") {
                players[p].sprite.destroy();
                delete players[p].sprite;
                delete ship;
            }

            if (players[p].team === "you" && players[p].status != "sunk") {
                createPlayerShip(players[p].position, players[p].orientation)
            }
        };
    }

    function createPlayerShip(position, orientation) {
        delete ship;
        ship = new Ship(position.x, position.y, position.z, orientation);
    }


function createConnection() {
    socket = io.connect('/');
    //Now we can listen for that event
    socket.on('onconnected', function (data) {
        //Note that the data is the object we sent from the server, as is. So we can assume its id exists.
        console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);
    });

    socket.on('gamestate', function (data) {
        data.players.forEach(function (player) {
            let socketId = player.id;
            if (typeof players[socketId] === "undefined") {
                players[socketId] = {
                    health: new Health(),
                };
            }
            players[socketId].team = player.team;
            players[socketId].position = player.position;
            players[socketId].orientation = player.orientation;
			players[socketId].shoot_orientation = player.shoot_orientation;
            players[socketId].status = player.status;
            players[socketId].health.updateHealth(player.health);

        });
        renderShips();
        //makeFuckingGridBlueAgain();
        if (data.step == 0) {
            game_status = MOVING;
            destroyPredictionShip();
        }
    });

    socket.on('disconnected', function (id) {
        console.log('Que covard! el ' + id + ' s\'ha desconnectat!');
        players[id].sprite.destroy();
        delete players[id];
    });

    socket.on('turn_start', function (turnDuration) {
        console.log('turn start! Duration: ' + turnDuration);
        resetActions();
        timer.start(turnDuration * 1000);
    });

}

function canActionBeDone() {
    return maxActionsPerTurn > actionsDone;
}

function addActionDone() {
    actionsDone++;
}

function resetActions() {
    game_status = WAITFORMOVES;
    actionsDone = 0;
    if (typeof ship != "undefined"){
        let pos = ship.getPosition();
        predictionShip = new Ship (pos.x, pos.y, pos.z, ship.getOrientation());
        predictionShip.sprite = sprites.ships.create(0, 0, 'playership');
        if (players[socket.id].status != "sunk") {
            drawPredictionShip();
            calcPredictionValidMoves();
        }
    }
    attackedTiles = [];
}

function drawPredictionShip() {
    setAnchorMid(predictionShip.sprite);
    predictionShip.sprite.scale.setTo(SCALE);
    predictionShip.sprite.alpha = 0.75;
    predictionShip.sprite.angle = (predictionShip.getOrientation() - 1) * 60;

    let predictionShip_hex_position = predictionShip.getPosition();
    let predictionShip_2d_position = predictionShip_hex_position.position2d();
    predictionShip_2d_position = position2DToPixels(predictionShip_2d_position.x,predictionShip_2d_position.y);
    predictionShip.sprite.x = predictionShip_2d_position.x;
    predictionShip.sprite.y = predictionShip_2d_position.y;

}

function destroyPredictionShip() {
    if (predictionShip != null)
        predictionShip.sprite.destroy();
    predictionShip = null;
}

function actionsLeft() {
        return maxActionsPerTurn - actionsDone;
}

function renderActionsLeft() {
    actionsLeftText.setText('Accions restants: ' + actionsLeft());
}

function calcPredictionValidMoves() {
    if (!canActionBeDone()){
        validMoves = {};
    }
    else if (predictionShip !== null) {
            let valid = predictionShip.get_valid_moves();
            validMoves = {};
            for (let i = 0; i < valid.length; i++) {
                if (typeof validMoves[valid[i].x] == "undefined") {
                    validMoves[valid[i].x] = {};
                }
                if (typeof validMoves[valid[i].x][valid[i].y] == "undefined") {
                    validMoves[valid[i].x][valid[i].y] = {};
                }
                validMoves[valid[i].x][valid[i].y][valid[i].z] = 0;
            }
        }
}