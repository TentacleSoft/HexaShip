class Timer  {
    constructor(maxWidth, x, y) {
        this.timer = new Phaser.Rectangle(x, y, maxWidth, 30 * SCALE, 1);
        this.maxWidth = maxWidth;
        this.duration = 10000;
        this.started = false;
    }

    start(duration) {
        this.started = true;
        this.duration = duration;
        this.timerEnd = new Date().getTime() + duration;
    }

    render(graphics) {
        if (!this.started) return;
        let currentTime = new Date().getTime();
        while (this.timerEnd < currentTime) {
            this.timerEnd += this.duration;
        }

        let left = (this.timerEnd - currentTime)/ this.duration;
        if (left < 0) left = 0;
        this.timer.width = this.maxWidth * left;
        graphics.beginFill(0x33cc33);
        graphics.drawPolygon([this.timer.bottomLeft, this.timer.bottomRight, this.timer.topRight, this.timer.topLeft]);
        graphics.endFill();
    }
}