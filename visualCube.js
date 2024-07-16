class VisualCube {
    constructor(width, height, scale, thetaX, thetaY, thetaZ, cubeSize, gapSize) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.thetaX = thetaX;
        this.thetaY = thetaY;
        this.thetaZ = thetaZ;

        this.cubeSize = cubeSize;
        this.gapSize = gapSize;

        this.cubeString = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

        this.drawInside = false;

        this.shift = (Math.PI / 2) / 15;

        this.faceStickers = getFaceStickers(cubeSize, gapSize);
        this.points = [
            [-1, -1, 1],
            [1, -1, 1],
            [1,  1, 1],
            [-1, 1, 1],
            [-1, -1, -1],
            [1, -1, -1],
            [1, 1, -1],
            [-1, 1, -1]
        ];
        this.stickerColors = {
            "U": WHITE,
            "D": YELLOW,
            "R": RED,
            "L": ORANGE,
            "F": GREEN,
            "B": BLUE,
            "z": BLACK,
            "x": "#555555",
            "r": "#A0A0A0", // grey out stickers in restricted memo mode
        }
        this.faceBase = {
            "U": [this.points[4], this.points[5], this.points[1], this.points[0]],
            "D": [this.points[7], this.points[6], this.points[2], this.points[3]],
            "R": [this.points[1], this.points[5], this.points[6], this.points[2]],
            "L": [this.points[4], this.points[0], this.points[3], this.points[7]],
            "F": [this.points[0], this.points[1], this.points[2], this.points[3]],
            "B": [this.points[4], this.points[5], this.points[6], this.points[7]]
        }

        // console.log(this.faceStickers);
    }


    
    
    drawStickers(ctx, colors, border, stickers) {
        for (let i = 0; i < stickers.length; ++i) {
            let sticker4Points = [];
            let s = stickers[i];
            s.forEach((pt) => {
                let rotated2d = [[pt[0]], [pt[1]], [pt[2]]];
    
                rotated2d = matrixProd(getRotationMatrix(this.thetaZ, "z"), rotated2d);
                rotated2d = matrixProd(getRotationMatrix(this.thetaY, "y"), rotated2d);
                rotated2d = matrixProd(getRotationMatrix(this.thetaX, "x"), rotated2d);
    
                let projected2d = matrixProd(PROJECTION, rotated2d);
    
                let x = Math.round(projected2d[0][0] * this.scale + this.width/2);
                let y = Math.round(projected2d[1][0] * this.scale + this.height/2);
    
                sticker4Points.push([x, y]);
            });
            
            ctx.fillStyle = this.stickerColors[colors[i]];
            ctx.beginPath();
            ctx.moveTo(sticker4Points[0].x, sticker4Points[0].y);
    
            for (let i = 0; i < sticker4Points.length; ++i) {
                ctx.lineTo(sticker4Points[i][0], sticker4Points[i][1]);
            }
    
            ctx.closePath();
            ctx.fill();
    
            ctx.strokeStyle = border;
            ctx.lineWidth = 2.5; 
            ctx.beginPath();
            ctx.moveTo(sticker4Points[0].x, sticker4Points[0].y);
    
            for (let i = 0; i < sticker4Points.length; ++i) {
                ctx.lineTo(sticker4Points[i][0], sticker4Points[i][1]);
            }
    
            ctx.closePath();
            ctx.stroke();
        }
    }

    drawCube(ctx) {
        ctx.imageSmoothingEnabled = true;

        // clear canvas first
        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, this.width, this.height);
    
        // compute distance to camera to get face rendering order
        let newPoints = [];
        this.points.forEach((pt) => {
            let rotated2d = [[pt[0]], [pt[1]], [pt[2]]];
            rotated2d = matrixProd(getRotationMatrix(this.thetaZ, "z"), rotated2d);
            rotated2d = matrixProd(getRotationMatrix(this.thetaY, "y"), rotated2d);
            rotated2d = matrixProd(getRotationMatrix(this.thetaX, "x"), rotated2d);
    
            let np = [rotated2d[0], rotated2d[1], rotated2d[2]]
            
            newPoints.push(np);
        });
    
    
        let newFaceBase = {
            "U": [newPoints[4], newPoints[5], newPoints[1], newPoints[0]],
            "D": [newPoints[7], newPoints[6], newPoints[2], newPoints[3]],
            "R": [newPoints[1], newPoints[5], newPoints[6], newPoints[2]],
            "L": [newPoints[4], newPoints[0], newPoints[3], newPoints[7]],
            "F": [newPoints[0], newPoints[1], newPoints[2], newPoints[3]],
            "B": [newPoints[4], newPoints[5], newPoints[6], newPoints[7]]
        };
    
        let dists = [];
        for (const [k, v] of Object.entries(newFaceBase)) {
            let dtc = distToCam(v, this.width);
            dists.push([dtc, k]);
        }
        dists.sort();
        dists.reverse();
        
        // console.log(this.cubeString);
        let cubeData = convertCubeString(this.cubeString);
        // console.log(cubeData);
    
        for (let i = 0; i < dists.length; ++i) {
            let face = dists[i][1];
            // console.log(this.faceStickers);
            if (this.drawInside) {
                this.drawStickers(ctx, "z", BLACK, [this.faceBase[face]]);
            }
            this.drawStickers(ctx, cubeData[face], BLACK, this.faceStickers[face]);
        }
    }

}

/*
"UUUUUUUUUR...F...D...L...B..."

U 0-8
R 9-17
F 18-26
D 27-35
L 36-44
B 45-53

             +------------+
             | U1  U2  U3 |
             |            |
             | U4  U5  U6 |
             |            |
             | U7  U8  U9 |
+------------+------------+------------+------------+
| L1  L2  L3 | F1  F2  F3 | R1  R2  R3 | B1  B2  B3 |
|            |            |            |            |
| L4  L5  L6 | F4  F5  F6 | R4  R5  R6 | B4  B5  B6 |
|            |            |            |            |
| L7  L8  L9 | F7  F8  F9 | R7  R8  R9 | B7  B8  B9 |
+------------+------------+------------+------------+
             | D1  D2  D3 |
             |            |
             | D4  D5  D6 |
             |            |
             | D7  D8  D9 |
             +------------+
*/