CANNON_RANGE = 3

class Ship {
    constructor(x, y, z, orientation) {
        this.position = new HexPosition(x, y, z);
        this.orientation = orientation;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    get_all_canons(){
        return this.position.get_back_side_lines(this.orientation,CANNON_RANGE).concat(this.position.get_front_side_lines(this.orientation,CANNON_RANGE));
    }

	get_valid_moves(){
		let lines = this.position.get_back_side_lines(this.orientation,2).concat(this.position.get_front_side_lines(this.orientation,2));
        lines.push(this.position.get_line_towards(this.orientation,2));
        let cells = [].concat.apply([],lines);
        return cells;
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
