

class Player {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.position = new HexPosition(0,0,0)
		this.orientation = Orientation.U;
	}

	setOrientation(orientation) {
		this.orientation = orientation;
	}

	turnRight() {
		this.rotation = (this.rotation + 1) % 6;
	}



	move_towards(orientation) {
		this.position = this.position.move_towards(orientation,1)
	}

	getPosition(){
		return this.position;
	}
	getOrientation(){
		return this.orientation;
	}
}