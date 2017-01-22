var HexPositions = require('./../client/js/objects/hexpositions'),
    HexPosition = HexPositions.position,
    Orientation = HexPositions.orientation;

HEALTH = 3;

class Ship {
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.D;
        this.health = HEALTH;
        this.status = "alive";
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    move_towards(orientation,ships) {
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
		let cells = [].concat.apply([],lines);
		return cells;
	}

    getPosition() {
        return this.position;
    }

    getOrientation() {
        return this.orientation;
    }



    shoot(orientation,ships){
        var shipToHurt = false;
        var minimumDistance = 1000;
        var self = this;
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
                shipToHurt.hurt(2);
			}else if(minimumDistance < 4) {
                shipToHurt.hurt(1);
            }
			console.log("player hurt! "+shipToHurt.health+" hp left");
        }

    }
}

module.exports = Ship;
