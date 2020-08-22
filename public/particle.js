class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        if (this.type === "red") { //red
            this.r = 4;
            this.nextColor = [231, 12, 12];
        } else if (this.type == "green") { //green 
            this.r = 8;
            this.nextColor = [46, 223, 6];
        } else {
            this.r = 16;
            this.nextColor = [7, 74, 218]; //blue 
        }
        this.opacity = 30;
        this.normalColor = [89, 87, 87];
        this.normalColor = this.nextColor;
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(1, 3));
    }
    show() {
        fill(this.normalColor[0], this.normalColor[1], this.normalColor[2], this.opacity);
        noStroke();
        ellipse(this.x, this.y, this.r * 2);
    }
    update() {
        if (this.frameCount % 300 == 0) {
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(1, 3));
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
        if (this.x < this.r) {
            this.x = this.r;
            this.vel.x *= -1;
        } else if (this.x > width - this.r) {
            this.x = width - this.r;
            this.vel.x *= -1;
        }
        if (this.y < this.r) {
            this.y = this.r;
            this.vel.y *= -1;
        } else if (this.y > height - this.r) {
            this.y = height - this.r;
            this.vel.y *= -1;
        }
    }
}