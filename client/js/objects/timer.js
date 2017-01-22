class Timer  {
    constructor(maxWidth, x, y) {
        this.timer = new Phaser.Rectangle(x, y, maxWidth, 30 * SCALE, 1);
        this.maxWidth = maxWidth;
        this.started = false;
    }

    start(duration) {
        this.started = true;
        this.duration = duration;
        this.timerEnd = new Date().getTime() + duration;
    }

    render(graphics) {
        let left = 1;
        if (this.started) {
            let currentTime = new Date().getTime();

            left = (this.timerEnd - currentTime) / this.duration;
            if (left < 0) {
                left = 0;
            }
        }
        this.timer.width = this.maxWidth * left;

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
        graphics.drawPolygon([this.timer.bottomLeft, this.timer.bottomRight, this.timer.topRight, this.timer.topLeft]);
        graphics.endFill();
    }
}