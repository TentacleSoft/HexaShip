import { Orientation } from '../core/orientation';

export interface Order { }

export class Move implements Order {
    orientation: Orientation;

    constructor(orientation: Orientation) {
        this.orientation = orientation;
    }
}

export class Shoot implements Order {
    orientation: Orientation;

    constructor(orientation: Orientation) {
        this.orientation = orientation;
    }
}
