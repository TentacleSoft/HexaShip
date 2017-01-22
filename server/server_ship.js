var HexPositions = require('./../client/js/objects/hexpositions'),
    HexPosition = HexPositions.position,
    Orientation = HexPositions.orientation;

HEALTH = 3;

function array_of_arrays_to_array(arr){
	return cells = [].concat.apply([],arr);
}

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
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.D;
        this.health = HEALTH;
        this.status = "alive";
        this.shoot_orientation = Orientation.None;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    move_towards(orientation,ships) {

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
		var blocked = false;
		ships.forEach(function(ship){
			if(ship.position.equals(new_position) && ship.status != "sunk"){
				blocked = true;
			}
		});

		if(!blocked && new_position.within_box()){
			let valid_moves = this.get_valid_moves();
			for(let i = 0; i < valid_moves.length; i++ ){
				if(valid_moves[i].equals(new_position)){
					this.position = new_position;
				}
            }

        }
	}
    hurt(damage){
        this.health -= damage;
        if(this.health <= 0){
			this.status = "sunk";
			console.log("ship sunk!")
        }
    }


	get_valid_moves(){
		let lines = this.position.get_back_side_lines(this.orientation,2).concat(this.position.get_front_side_lines(this.orientation,2));
		lines.push(this.position.get_line_towards(this.orientation,2));
		return array_of_arrays_to_array(lines);
	}

    getPosition() {
        return this.position;
    }

    getOrientation() {
        return this.orientation;
    }

	get_canon_lines(){
		return this.position.get_back_side_lines(this.orientation,CANNON_RANGE).concat(this.position.get_front_side_lines(this.orientation,CANNON_RANGE));
	}

    shoot(orientation,ships){
        var shipToHurt = false;
        var minimumDistance = 1000;
        var self = this;

        if(this.position.get_side_orientations(this.orientation).indexOf(orientation) >= 0){

			console.log("shoot");
		}else{
			console.log("invalid shoot!");
        	return;
		}
		this.shoot_orientation = orientation;
        this.status = "shooting";
        ships.forEach(function(ship){
            if(self.position.straight_orientation_to(ship.position) == orientation && ship.status != "sunk"){
                let distance = self.position.distance_to(ship.position)
                if(distance < minimumDistance){
                    shipToHurt = ship;
					minimumDistance = distance;
                }
            }

        });
        if(shipToHurt){

            if(minimumDistance == 1) {
                shipToHurt.hurt(3);
			}else if(minimumDistance < 4) {
                shipToHurt.hurt(1);
            }
			console.log("player hurt! "+shipToHurt.health+" hp left");
        }

    }
}

module.exports = Ship;
