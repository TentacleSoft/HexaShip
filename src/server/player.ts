import { OrderQueue } from './order_queue';
import { Ship } from './../core/ship';

export class Player {
    ship: Ship;
    socket;
    orders: OrderQueue;

    constructor(ship: Ship, socket) {
        this.ship = ship;
        this.socket = socket;
        this.orders = new OrderQueue();
    }
}
