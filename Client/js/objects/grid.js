class Grid {
	constructor (size_x, size_y) {
		this.cells = new Array (size_x);
		for (let i = 0; i < size_x; i++){
			this.cells[i] = new Array (size_y);
		}
		console.log("Grid " + size_x + ", " + size_y + " created.");
	}
}