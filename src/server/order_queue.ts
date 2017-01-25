import { Shoot, Order } from './order';

export const Size = 3;

export class OrderQueue {
    orders: Order[];

    constructor() {
        this.orders = [];
    }

    push(order: Order) {
        // TODO avoid pushing orders during turn processing?

        if (this.orders.length >= Size) {
            return;
        }

        // Limit to 1 shoot at a time
        if (order instanceof Shoot) {
            for (var i in this.orders) {
                if (this.orders[i] instanceof Shoot) {
                    return;
                }
            }
        }

        this.orders.push(order);
    }

    pop(): Order {
        return this.orders.shift();
    }
}
