Orientation = {
    U  : 1,
    UR : 2,
    DR : 3,
    D  : 4,
    DL : 5,
    UL : 6,
    None: 0
}


class HexPosition {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    unitary_vector(orientation){
        x = y = z
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
        return (Math.abs(this.x - pos.x)+Math.abs(this.y-pos.y)+Math.abs(this.z-pos.z))/2
    }


    straight_orientation_to(pos) {
        if(!this.is_valid() || !pos.is_valid()){
            return -1;
        }
        if (pos.x == this.x) {
            if (pos.y > this.y) {
                return Orientation.U
            }
            else {
                return Orientation.D
            }
        }
        else if (pos.y == this.y) {
            if (pos.x > this.x) {
                return Orientation.UR
            }
            else {
                return Orientation.DL
            }
        }
        else if (pos.z == this.z) {
            if (pos.y > this.y) {
                return Orientation.UL
            }
            else {
                return Orientation.DR
            }
        } else {
            return Orientation.None
        }
    }
    //per quan una posició representi un vector, multiplicar resulta en distancia * 2 en la mateixa direcció,
    //incús no-rectes
    product(factor){
        return new HexPosition(this.x*2,this.y*2,this.z*2)
    }
    //es una posicio, però generalment només hauries de sumar vectors
    add(pos){
        return new HexPosition(this.x+pos.x,this.y+pos.y,this.z+pos.z)
    }
    move_towards(orientation,distance){
        hexPosition = new HexPosition(this.x,this.y,this.z)
        dx = dy = dz = 0

    }
}









function test_hexposition(){
    tests = [[new HexPosition(3, -1, -2),new HexPosition(2, -1, -1),1,Orientation.DL],
                [new HexPosition(-3, 0, 3),new HexPosition(1, 0, -1),4,Orientation.UR],
                [new HexPosition(-3, 3, 0),new HexPosition(2, 0, -2),5,Orientation.None],
                [new HexPosition(1, 1, -2),new HexPosition(1, -3, 2),4,Orientation.D],
                [new HexPosition(-2, 1, 1),new HexPosition(0, 0, 0),2,Orientation.None],
                [new HexPosition(3, -2, -1),new HexPosition(-1, -2, 1),-1,-1]]


    tests.forEach(function(test){
        hexcosa = test[0]
        hexcusa = test[1]
        expected_distance = test[2]
        expected_orientation = test[3]
        distance = hexcosa.distance_to(hexcusa)
        orientation = hexcosa.straight_orientation_to(hexcusa)

        if(distance != expected_distance){
            console.log("Wrong distance: "+distance)
        }

        if(orientation != expected_orientation){
            console.log("Wrong orientation: "+orientation)
        }
    });

}

test_hexposition()