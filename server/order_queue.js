const size = 3;

class OrderQueue {
    constructor() {
        this.orders = [];
    }

    push(order) {
        // TODO avoid pushing orders during turn processing

        if (this.orders.length >= size) {
            return;
        }

        this.orders.push(order);
    }

    pop() {
        return this.orders.unshift();
    }
}

module.exports = OrderQueue;