export class Camera {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.isScreenShaking = false;
        this.shakeIntensity = 0;
        this.shakeDuration = 0; // Duration in ms
        this.shakeStartTime = 0;
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    moveBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    worldToScreen(x, y) {
        return {
            x: x - this.x,
            y: y - this.y
        };
    }

    screenToWorld(x, y) {
        return {
            x: x + this.x,
            y: y + this.y
        };
    }

    startScreenShake(intensity, duration) {
        if (!this.isScreenShaking) {
            this.isScreenShaking = true;
            this.shakeIntensity = intensity;
            this.shakeDuration = duration;
            this.shakeStartTime = performance.now();
        }
    }

    updateScreenShake(ctx) {
        if (this.isScreenShaking && this.shakeDuration > 0) {
            let elapsed = performance.now() - this.shakeStartTime;
            if (elapsed < this.shakeDuration) {
                let shakeX = Math.random() * this.shakeIntensity - this.shakeIntensity / 2;
                let shakeY = Math.random() * this.shakeIntensity - this.shakeIntensity / 2;
                ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);
            } else {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.isScreenShaking = false;
                this.shakeDuration = 0;
            }
        }
    }
}