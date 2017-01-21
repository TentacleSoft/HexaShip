"use strict";

let Orientation = {
    U  : 1,
    UR : 2,
    DR : 3,
    D  : 4,
    DL : 5,
    UL : 6,
    None: 0
};

function turn_right(orientation,factor){
    let new_orientation = orientation + factor;
    while(new_orientation > 6){
		new_orientation-6;
	}
	while(new_orientation < 1){
		new_orientation+6;
	}
	return new_orientation;
}

function turn_left(orientation,factor){
    return turn_right(orientation,-factor);
}

class HexPosition {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy(){
       return new HexPosition(this.x,this.y,this.z);
    }
    static unitary_vector(orientation){
        let x = 0, y = 0, z = 0;
        switch(orientation) {
            case Orientation.U:
                x = 0;
                y = 1;
                z = -1;
                break;
            case Orientation.UR:
                x = 1;
                y = 0;
                z = -1;
                break;
            case Orientation.DR:
                x = 1;
                y = -1;
                z = 0;
                break;
            case Orientation.D:
                x = 0;
                y = -1;
                z = 1;
                break;
            case Orientation.DL:
                x = -1;
                y = 0;
                z = 1;
                break;
            case Orientation.UL:
                x = -1;
                y = 1;
                z = 0;
                break;
            default:
                console.log("DEFAULTED");
                break;
        }
        return new HexPosition(x,y,z);
    }
    is_valid(){
        return this.x+this.y+this.z == 0;
    }
    distance_to(pos) {
        if(!this.is_valid()|| !pos.is_valid()){
            return -1;
        }
        return (Math.abs(this.x - pos.x)+Math.abs(this.y-pos.y)+Math.abs(this.z-pos.z))/2;
    }

    cardinality(){
        let center = new HexPosition(0,0,0);
        return this.distance_to(center);
    }

    straight_orientation_to(pos) {
        if(!this.is_valid() || !pos.is_valid() || this.equals(pos)){
            return Orientation.None;
        }
        if (pos.x == this.x) {
            if (pos.y > this.y) {
                return Orientation.U;
            }
            else {
                return Orientation.D;
            }
        }
        else if (pos.y == this.y) {
            if (pos.x > this.x) {
                return Orientation.UR;
            }
            else {
                return Orientation.DL;
            }
        }
        else if (pos.z == this.z) {
            if (pos.y > this.y) {
                return Orientation.UL;
            }
            else {
                return Orientation.DR;
            }
        } else {
            return Orientation.None;
        }
    }
    orientationFromCentre(){
        let center = new HexPosition(0,0,0);
        return this.straight_orientation_to(center);
    }
    //per quan una posició representi un vector, multiplicar resulta en distancia * 2 en la mateixa direcció,
    //incús no-rectes
    product(factor){
        return new HexPosition(this.x*factor,this.y*factor,this.z*factor);
    }
    //es una posicio, però generalment només hauries de sumar vectors
    add(pos){
        return new HexPosition(this.x+pos.x,this.y+pos.y,this.z+pos.z)
    }
    substract(pos){
        return this.add(pos.product(-1));
    }
    equals(pos){
        return this.x == pos.x && this.y == pos.y && this.z == pos.z;
    }
    move_towards(orientation,distance){
        let hexPosition = HexPosition.unitary_vector(orientation);
        hexPosition = hexPosition.product(distance);

        return hexPosition.add(this)

    }
    position2d(){
        let downleftUprightDistance = this.x;
        let downleftUprightVector = HexPosition.unitary_vector(Orientation.DL).product(downleftUprightDistance);
        let centeredVector = this.add(downleftUprightVector);
        let upDownDistance = centeredVector.cardinality();

        if(centeredVector.orientationFromCentre() == Orientation.D){
            upDownDistance *= -1;
        }
        return {x: downleftUprightDistance*0.866,y: -downleftUprightDistance*0.5+upDownDistance}
    }
    stringify(){
        return "x: "+this.x+", y: "+this.y+", z: "+this.z
    }
    get_neighbours(){
        let neighbours = [];
        for(var orientation in Orientation){
            if(Orientation[orientation] != Orientation.None){
                let new_position = this.move_towards(Orientation[orientation],1);
                neighbours.push(new_position)
            }

        };
        return neighbours;
    }
    get_line_towards(orientation,max_dist){
        let linePositions = [];
        for (var i = 1; i < max_dist; i++) {
            let new_position = this.move_towards(orientation,i);
            linePositions.push(new_position)
        }
        return linePositions;
    }
    within_center(boardLength){
        return this.cardinality() <= boardLength;
    }
}


function test_hexposition(){
    let tests = [   [new HexPosition(3, 0, -3),new HexPosition(1, 0, -1),2,Orientation.DL],
                [new HexPosition(-3, 0, 3),new HexPosition(1, 0, -1),4,Orientation.UR],
                [new HexPosition(3, -1, -2),new HexPosition(2, -1, -1),1,Orientation.DL],
                [new HexPosition(-3, 3, 0),new HexPosition(2, 0, -2),5,Orientation.None],
                [new HexPosition(1, 1, -2),new HexPosition(1, -3, 2),4,Orientation.D],
                [new HexPosition(-2, 1, 1),new HexPosition(0, 0, 0),2,Orientation.None],
                [new HexPosition(3, -2, -1),new HexPosition(-1, -2, 1),-1,Orientation.None]];


    tests.forEach(function(test){
        let hexcosa = test[0];
        let hexcusa = test[1];
        let expected_distance = test[2];
        let expected_orientation = test[3];
        let distance = hexcosa.distance_to(hexcusa);
        let orientation = hexcosa.straight_orientation_to(hexcusa);

        if(distance != expected_distance){
            console.log("Wrong distance: "+distance)
        }

        if(orientation != expected_orientation){
            console.log("Wrong orientation: "+orientation)
        }
        else if(orientation != Orientation.None){
            let movedHexcosa = hexcosa.move_towards(orientation,distance);
            if(!movedHexcosa.equals(hexcusa)){
                console.log("Wrong movement!: "+movedHexcosa.x+","+movedHexcosa.y+","+movedHexcosa.z)
            }
        }
        console.log("line towards UR of "+hexcosa.stringify()+":");
        hexcosa.get_line_towards(Orientation.UR,4).forEach(function(neighbour) {
            if(neighbour.within_center(3)){
                console.log(neighbour.stringify())
            }

        })
    });

}

//test_hexposition();

module.exports = {
    position: HexPosition,
    orientation: Orientation
};
