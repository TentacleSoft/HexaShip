var HexPositions = require('./client/js/objects/hexpositions'),
    HexPosition = HexPositions.position,
    Orientation = HexPositions.orientation;

HEALTH = 3;

class Ship {
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.U;
        this.health = HEALTH;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    move_towards(orientation) {
		this.position = this.position.move_towards(orientation, 1)
	}
    hurt(damage){
        this.health -= damage;
    }

    getPosition() {
        return this.position;
    }

    getOrientation() {
        return this.orientation;
    }

    shoot(orientation,ships){
        shipToHurt = null;
        minimumDistance = 1000;
        ships.forEach(function(ship){
            if(this.position.straight_orientation_to(ship.position) == orientation){
                let distance = this.position.distance_to(ship.position)
                if(distance < minimumDistance){
                    shipToHurt = ship;
                    minumumDistance = distance;
                }
            }

        });
        if(shipToHurt){
            if(minimumDistance == 1) {
                shipToHurt.hurt(2);
			}else if(minimumDistance < 4) {
                shipToHurt.hurt(1);
            }
        }
    }
}

module.exports = Ship;
