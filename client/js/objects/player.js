

class Player {
	constructor(x,y) {
		this.position = new HexPosition(0,0,0)
		this.orientation = Orientation.U;
	}

	setOrientation(orientation) {
		this.orientation = orientation;
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