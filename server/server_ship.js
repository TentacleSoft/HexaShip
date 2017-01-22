var HexPositions = require('./../client/js/objects/hexpositions'),
    HexPosition = HexPositions.position,
    Orientation = HexPositions.orientation;

HEALTH = 3;

class Ship {
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.U;
        this.health = HEALTH;
        this.status = "alive";
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    move_towards(orientation) {
		this.position = this.position.move_towards(orientation, 1)
	}
    hurt(damage){
        this.health -= damage;
        if(this.health <= 0){
			this.status = "sunk";
			console.log("ship sunk!")
        }
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
            console.log("shooting! to "+orientation);
            console.log(ship);
            if(self.position.straight_orientation_to(ship.position) == orientation){
                let distance = self.position.distance_to(ship.position)
                if(distance < minimumDistance){
                    shipToHurt = ship;
					minimumDistance = distance;
                }
            }

        });
        if(shipToHurt){
            console.log("player hurt! ");
            if(minimumDistance == 1) {
                shipToHurt.hurt(2);
			}else if(minimumDistance < 4) {
                shipToHurt.hurt(1);
            }
        }

    }
}

module.exports = Ship;
