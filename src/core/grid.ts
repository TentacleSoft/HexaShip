export class Grid {
	cells: number[][];

	constructor(size_x, size_y) {
		this.cells = new Array(size_x);
		for (let i = 0; i < size_x; i++) {
			this.cells[i] = [];
			for (let j = 0; j < size_y; j++) {
				this.cells[i][j] = 0;
			}
		}
		this.cells[3][3] = -1;
	}

	getCell(x, y) {
		return this.cells[x][y];
	}
}