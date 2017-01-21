class Player {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.rotation = 0;
	}

	turnLeft() {
		this.rotation = (this.rotation + 5) % 6;
	}

	turnRight() {
		this.rotation = (this.rotation + 1) % 6;
	}

	move() {
		if (this.rotation == 0) {
			this.x += 1;
			this.y -= 1;
		}
		else if (this.rotation == 1) {
			this.x += 1;
		}
		else if (this.rotation == 2) {
			this.y += 1;
		}
		else if (this.rotation == 3) {
			this.x -= 1;
			this.y += 1;
		}
		else if (this.rotation == 4) {
			this.x -= 1;
		}
		else if (this.rotation == 5) {
			this.y -= 1;
		}
	}

	getPosition(){
		return {x: this.x, y: this.y, rotation: this.rotation};
	}
}