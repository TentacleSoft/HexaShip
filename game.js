"use strict";
const hp = require("hexpositions");

class Game {
    constructor() {
        this.objects = [];
    }

    update() {
        this.objects.forEach(function (object) {
            object.update();
        });
    }
}

class GameObject {
    constructor() {
        this.position = 3;
    }

    update() {
        // TODO
    }
}

class Ship extends GameObject {
    update() {
        super.update();
    }
}

let game = new Game();
let shippymcshipface = new Ship()
let hexpos = new hp.HexPosition(-3, 0, 3)
console.log("hola "+hexpos.cardinality());