class Health  {
    constructor() {
        this.CUSTOM_SCALE = 1;

        this.xOffset = -30 * SCALE;
        this.yOffset = -50 * SCALE;

        this.maxWidth = this.CUSTOM_SCALE * 60 * SCALE; // TODO this is hardcoded, use scale
        this.maxHealth = 3; // TODO hardcoded, get from server or something
        this.currentHealth = this.maxHealth;
        let barHeight = 10 * SCALE * this.CUSTOM_SCALE;
        this.bar = new Phaser.Rectangle(0, 0, this.maxWidth * this.CUSTOM_SCALE, barHeight);

    }

    updatePosition(x, y) {
        this.bar.x = x + this.xOffset;
        this.bar.y = y + this.yOffset;
    }

    updateHealth(currentHealth) {
        this.currentHealth = currentHealth;
    }

    render(graphics) {
        let left = this.currentHealth / this.maxHealth;
        this.bar.width = this.maxWidth * left;

        let red = 0xff0000;
        let green = 0x00ff00;
        /*
        left = 1 => red = 0;
        left = 0.5 => red = 255
        left = 0.5 => green = 255
        left = 0 => green

         */
        if (left > 0.5) red = 256* 256 * Math.trunc((1 - left) * 2 * 255);
        else green = 256 * Math.trunc(255*left * 2);
        graphics.beginFill(red + green);
        graphics.drawPolygon([this.bar.bottomLeft, this.bar.bottomRight, this.bar.topRight, this.bar.topLeft]);
        graphics.endFill();
    }
}