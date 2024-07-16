

class DrawCanvasSticker {
    constructor(x1, y1, x2, y2, x3, y3, x4, y4, color, isFixed=false) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.x4 = x4;
        this.y4 = y4;
        this.color = color;
        this.isFixed = isFixed;
    }

    setColor(newColor) {
        if (!this.isFixed) {
            this.color = newColor;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.lineTo(this.x3, this.y3);
        ctx.lineTo(this.x4, this.y4);
        ctx.closePath();

        ctx.strokeStyle = 'black';
        ctx.fillStyle = STICKER_COLORS[this.color];
        ctx.fill();
        ctx.stroke();
    }
}