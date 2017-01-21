var OrderQueue = require('./order_queue');

class Player {
    constructor(ship, socket) {
        this.ship = ship;
        this.socket = socket;
        this.orders = new OrderQueue();
    }
}

module.exports = Player;
