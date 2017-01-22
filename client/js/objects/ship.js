CANNON_RANGE = 3

class Ship {
    constructor(x, y, z, orientation) {
        this.position = new HexPosition(x, y, z);
        this.orientation = orientation;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    get_canon_lines(){
        return this.position.get_back_side_lines(this.orientation,CANNON_RANGE).concat(this.position.get_front_side_lines(this.orientation,CANNON_RANGE));
    }

	get_valid_moves(){
		return this.position.get_valid_move_cells(this.orientation);
	}

    move_towards(orientation) {
        this.position = this.position.move_towards(orientation, 1);
    }

    getPosition() {
        return this.position;
    }

    getOrientation() {
        return this.orientation;
    }
}
