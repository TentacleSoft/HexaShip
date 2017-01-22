CANNON_RANGE = 3
function turn_right(orientation,factor){
        if(!factor) factor = 1;
        let new_orientation = orientation + factor;
        while(new_orientation > 6){
            new_orientation -= 6;
        }
        while(new_orientation < 1){
            new_orientation += 6;
        }
        return new_orientation;
    }
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

    //server stuff for prediction ship (modified: no restrictions on client)

    

    get_valid_moves(){
        let lines = this.position.get_back_side_lines(this.orientation,2).concat(this.position.get_front_side_lines(this.orientation,2));
        lines.push(this.position.get_line_towards(this.orientation,2));
        return array_of_arrays_to_array(lines);
    }

    move_towards(orientation) {

        if(orientation == turn_right(this.orientation,3)){
            return;
        }
        if(orientation == turn_right(this.orientation,2) || orientation == turn_right(this.orientation,4)){
            this.orientation = orientation;
            return;
        }
        this.orientation = orientation;

        var new_position = this.position.move_towards(orientation, 1);
        var self = this;

        if(new_position.within_box()){
            let valid_moves = this.get_valid_moves();
            for(let i = 0; i < valid_moves.length; i++ ){
                if(valid_moves[i].equals(new_position)){
                    this.position = new_position;
                }
            }

        }
    }
}
