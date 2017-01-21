"use strict";

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
        // TODO
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

