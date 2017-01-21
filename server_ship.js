var HexPositions = require('./client/js/objects/hexpositions'),
    HexPosition = HexPositions.position,
    Orientation = HexPositions.orientation;

class Ship {
    constructor(x, y, z) {
        this.position = new HexPosition(x, y, z);
        this.orientation = Orientation.U;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
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

module.exports = Ship;
