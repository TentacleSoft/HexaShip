const WIDTH = 128,
	  HEIGHT = WIDTH * 0.866;

class Cell {
	constructor (id, x, y, type){
		this.id = id;
		this.x = x;
		this.y = y;
		this.type = type;
	}

	static get WIDTH() {
	    return WIDTH;
	  }

	  static get HEIGHT() {
	    return HEIGHT;
	  }
}