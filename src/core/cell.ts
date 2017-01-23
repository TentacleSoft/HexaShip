export const CELL_WIDTH = 128;
export const CELL_HEIGHT = CELL_WIDTH * 0.866;

export class Cell {
	id: number;
	x: number;
	y: number;
	type: string;

	constructor(id: number, x: number, y: number, type: string) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.type = type;
	}
}