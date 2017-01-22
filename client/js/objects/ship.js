CANNON_RANGE = 3

class Ship {
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.U;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    get_all_canons(){
        return pos.get_back_side_lines(this.orientation,CANNON_RANGE) + pos.get_front_side_lines(this.orientation,CANNON_RANGE)
    }

	get_valid_moves(){
		return pos.get_back_side_lines(this.orientation,1) + pos.get_front_side_lines(this.orientation,1) + pos.get_line_towards(this.orientation,1)
	}

    move_towards(orientation) {
        this.position = this.position.move_towards(orientation, 1)
    }

    getPosition() {
        return this.position;
    }

    getOrientation() {
        return this.orientation;
    }
}
