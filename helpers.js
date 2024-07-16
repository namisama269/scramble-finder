function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function reverseString(s) {
    return s.split('').reverse().join('');
}

function setCharAt(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

function convertCubeString(cubeString) { 
    return {
        "U": cubeString.substring(0, 9),
        "D": cubeString.substring(33, 36) + cubeString.substring(30, 33) + cubeString.substring(27, 30),
        "R": 
        cubeString[11] + cubeString[14] + cubeString[17] +
        cubeString[10] + cubeString[13] + cubeString[16] +
        cubeString[9] + cubeString[12] + cubeString[15],
        "L":
        cubeString[36] + cubeString[39] + cubeString[42] +
        cubeString[37] + cubeString[40] + cubeString[43] +
        cubeString[38] + cubeString[41] + cubeString[44],
        "F": cubeString.substring(18, 27),
        "B": 
        reverseString(cubeString.substring(45, 48)) + 
        reverseString(cubeString.substring(48, 51)) + 
        reverseString(cubeString.substring(51, 54)),
    }
}

const stickerFixRatio = 1;
// s = (2 - (n+1) * r) / n

function getXYStickers(cubeSize, gapSize, topLeftX, topLeftY, topLeftZ) {
    let stickers = [];
    let stickerSize = (2 - (cubeSize + stickerFixRatio) * gapSize) / cubeSize;

    for (let v = 0; v < cubeSize; ++v) {
        for (let h = 0; h < cubeSize; ++h) {
            let px = topLeftX + gapSize * (stickerFixRatio) + h * (gapSize + stickerSize);
            let py = topLeftY + gapSize * (stickerFixRatio) + v * (gapSize + stickerSize);
            let pz = topLeftZ;

            stickers.push([
                [px, py, pz],
                [px + stickerSize, py, pz],
                [px + stickerSize, py + stickerSize, pz],
                [px, py + stickerSize, pz]
            ])
        }
    }

    return stickers;
}

function getXZStickers(cubeSize, gapSize, topLeftX, topLeftY, topLeftZ) {
    let stickers = [];
    let stickerSize = (2 - (cubeSize + stickerFixRatio) * gapSize) / cubeSize;

    for (let v = 0; v < cubeSize; ++v) {
        for (let h = 0; h < cubeSize; ++h) {
            let px = topLeftX + gapSize * (stickerFixRatio) + h * (gapSize + stickerSize);
            let py = topLeftY;
            let pz = topLeftZ + gapSize * (stickerFixRatio) + v * (gapSize + stickerSize);

            stickers.push([
                [px, py, pz],
                [px + stickerSize, py, pz],
                [px + stickerSize, py, pz + stickerSize],
                [px, py, pz + stickerSize]
            ])
        }
    }

    return stickers;
}

function getYZStickers(cubeSize, gapSize, topLeftX, topLeftY, topLeftZ) {
    let stickers = [];
    let stickerSize = (2 - (cubeSize + stickerFixRatio) * gapSize) / cubeSize;

    for (let v = 0; v < cubeSize; ++v) {
        for (let h = 0; h < cubeSize; ++h) {
            let px = topLeftX;
            let py = topLeftY + gapSize * (stickerFixRatio) + h * (gapSize + stickerSize);
            let pz = topLeftZ + gapSize * (stickerFixRatio) + v * (gapSize + stickerSize);

            stickers.push([
                [px, py, pz],
                [px, py, pz + stickerSize],
                [px, py + stickerSize, pz + stickerSize],
                [px, py + stickerSize, pz]
            ])
        }
    }

    return stickers;
}

function getFaceStickers(cubeSize, gapSize) {
    return {
        "U": getXZStickers(cubeSize, gapSize, -1, -1, -1),
        "D": getXZStickers(cubeSize, gapSize, -1, 1, -1),
        "R": getYZStickers(cubeSize, gapSize, 1, -1, -1),
        "L": getYZStickers(cubeSize, gapSize, -1, -1, -1),
        "F": getXYStickers(cubeSize, gapSize, -1, -1, 1),
        "B": getXYStickers(cubeSize, gapSize, -1, -1, -1)
    }
}




function matrixProd(A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm * B[k][j]) ,0)
        })
    })
}

const PROJECTION = [
    [1, 0, 0],
    [0, 1, 0]
];

function getRotationMatrix(theta, axis) {
    if (axis == "z") {
        return [
            [Math.cos(theta), -Math.sin(theta), 0],
            [Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 1],
        ]
    } 

    if (axis == "y") {
        return [
            [Math.cos(theta), 0, Math.sin(theta)],
            [0, 1, 0],
            [-Math.sin(theta), 0, Math.cos(theta)],
        ]
    }

    if (axis == "x") {
        return [
            [1, 0, 0],
            [0, Math.cos(theta), -Math.sin(theta)],
            [0, Math.sin(theta), Math.cos(theta)],
        ]
    }

    return []
}

function distToCam(points, width) {
    let a = [0, 0, width];
    let b = [];
    for (let i = 0; i < 3; ++i) {
        let total = 0;
        for (let j = 0; j < 4; ++j) {
            total += points[j][i][0];
        }
        total /= 4;
        b.push(total);
    }
    
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    let dz = a[2] - b[2];

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}  

function invertMoves(moves) {
    if (moves == "") {
        return moves;
    }

    moves = moves.trim();
    moves = moves.replace(/\s+/g, " ");

    let moveArray = moves.split(' ');
    
    moveArray.reverse();
    
    function reverseMove(move) {
        if (move.includes('2')) {
            return move;
        } else if (move.includes("'")) {
            return move.replace("'", "");
        } else {
            return move + "'";
        }
    }

    let reversedMoves = moveArray.map(reverseMove);

    return reversedMoves.join(' ');
}

// supports normal comm notation and Elliott notation
// simple function to convert commutator notation to moves before passing to alg parser

function isCommutator(alg) {
    return alg.includes("/") || alg.includes(",") || alg.includes(":");
}

function commToMoves(alg) {
    if (!isCommutator(alg)) {
        return alg;
    }

    let out = "";

    // remove unnnecessary brackets
    alg = alg.replace(/[\[\]{}()]/g, "");

    // split comms joined by +
    comms = alg.includes("+") ? alg.split("+") : [alg];

    // process each comm
    comms.forEach(comm => {
        comm = comm.trim();
        comm = comm.replace(/\s+/g, " ");
        // console.log(comm);
        // get the setup move if exists
        let setup = "";
        if (comm.includes(":")) {
            let parts = comm.split(":");
            setup = parts[0];
            comm = parts[1];
        }

        // split on , or /
        let a = "", b = "";
        let mainComm = "";

        if (comm.includes(",")) {
            let parts = comm.split(",");
            a = parts[0], b = parts[1];
            mainComm = a + " " + b + " " + invertMoves(a) + " " + invertMoves(b);
        }
        else if (comm.includes("/")) {
            let parts = comm.split("/");
            a = parts[0], b = parts[1];
            mainComm = a + " " + b + " " + a + "2 " + invertMoves(b) + " " + a;
            mainComm = mainComm.replace(/'2/g, "2");
        }
        else {
            mainComm = comm;
        }

        // console.log(mainComm);

        let moves = setup + " " + mainComm + " " + invertMoves(setup);

        moves = moves.trim();
        moves = moves.replace(/\s+/g, " ");

        out += " " + moves;
    });

    out = out.trim();
    out = out.replace(/\s+/g, " ");
    return out;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function isPointInsideShape(points, mouseX, mouseY) {
    let inside = false;
    const n = points.length / 2;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = points[2 * i], yi = points[2 * i + 1];
        const xj = points[2 * j], yj = points[2 * j + 1];
        const intersect = ((yi > mouseY) !== (yj > mouseY)) &&
            (mouseX < (xj - xi) * (mouseY - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

function orient(cube, u, f) {
    for (let i = 0; i < 4; ++i) {
        if (cube.asString()[4] == u) {
            break;
        }
        cube.move("x");
    }

    for (let i = 0; i < 4; ++i) {
        if (cube.asString()[4] == u) {
            break;
        }
        cube.move("z");
    }

    for (let i = 0; i < 4; ++i) {
        if (cube.asString()[22] == f) {
            break;
        }
        cube.move("y");
    }
}

function removeScrambleSeparator(str) {
    // Split the string by ')' or ':'
    const parts = str.split(/[):]/);
    const lastSegment = parts.length > 1 ? parts[parts.length - 1].trim() : str.trim(); 
    return lastSegment;
}

function fixScramble(scramble) {
    // alg parser only reads r, not Rw
    scramble = scramble.replace("Uw", "u");
    scramble = scramble.replace("Dw", "d");
    scramble = scramble.replace("Fw", "f");
    scramble = scramble.replace("Bw", "b");
    scramble = scramble.replace("Lw", "l");
    scramble = scramble.replace("Rw", "r");

    scramble = removeScrambleSeparator(scramble);

    return scramble;
}

// given 2 cubes with partial coloring (uncolored stickers marked as "x")
// and in same orientation, is it possible for them to match the same cube?
// matching = no mismatches on colored (non "x") stickers
function isOrientedCubeStringMatching(cubeString1, cubeString2) {
    for (let i = 0; i < 54; ++i) {
        if (cubeString1[i] !== 'x' && cubeString2[i] !== 'x' && cubeString1[i] !== cubeString2[i]) {
            return false;
        }
    }
    return true;
}