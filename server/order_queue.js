const size = 3;

class OrderQueue {
    constructor() {
        this.orders = [];
    }

    push(order) {
        // TODO avoid pushing orders during turn processing?

        if (this.orders.length >= size) {
            return;
        }

        // Limit to 1 shoot at a time
        if (order.type === 'shoot') {
            for (var i in this.orders) {
                if (orders[i].type === 'shoot') {
                    return;
                }
            }
        }

        this.orders.push(order);
    }

    pop() {
        return this.orders.shift();
    }
}

module.exports = OrderQueue;