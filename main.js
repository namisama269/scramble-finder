const cube = new Cube();
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

const cubeCanvas = document.getElementById('cubeCanvas');
const cubeCtx = canvas.getContext('2d');

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

/**
 * removeScrambleSeparator trims numbering prefixes that often precede scrambles
 * when they are copied from lists. It strips patterns like "1.", "1)", "(1)",
 * and any trailing whitespace or colon so the returned string starts directly
 * with the scramble moves.
 */
function removeScrambleSeparator(str) {
    let cleaned = str.trim();

    // Remove leading numbering like "1.", "1)" or "(1)"
    const prefixPattern = /^(?:\(\d+\)|\d+[.)]?)/;
    if (prefixPattern.test(cleaned)) {
        // Drop the detected prefix plus any trailing whitespace or colon
        cleaned = cleaned.replace(/^(?:\(\d+\)|\d+[.)]?)[\s:]*/, '');
    }

    return cleaned.trim();
}

function fixScramble(scramble) {
    scramble = scramble.replace("Uw", "u");
    scramble = scramble.replace("Dw", "d");
    scramble = scramble.replace("Fw", "f");
    scramble = scramble.replace("Bw", "b");
    scramble = scramble.replace("Lw", "l");
    scramble = scramble.replace("Rw", "r");

    scramble = removeScrambleSeparator(scramble);

    return scramble;
}

function isOrientedCubeStringMatching(cubeString1, cubeString2) {
    for (let i = 0; i < 54; ++i) {
        if (cubeString1[i] !== 'x' && cubeString2[i] !== 'x' && cubeString1[i] !== cubeString2[i]) {
            return false;
        }
    }
    return true;
}

let bldOrientation = "";
let scramblingOrientation = "";
let identityCube = new Cube();
let bldOrientationCube = new Cube();
let scramblingOrientationCube = new Cube();

let bldOrientationMap = {};

let currColor = "x";

function setOrientation() {
    bldOrientationCube.identity();
    bldOrientationCube.move(bldOrientation);

    scramblingOrientationCube.identity();
    scramblingOrientationCube.move(scramblingOrientation);

    bldOrientationMap = {};
    bldOrientationMap[bldOrientationCube.asString()[0]] = "U";
    bldOrientationMap[bldOrientationCube.asString()[9]] = "R";
    bldOrientationMap[bldOrientationCube.asString()[18]] = "F";
    bldOrientationMap[bldOrientationCube.asString()[27]] = "D";
    bldOrientationMap[bldOrientationCube.asString()[36]] = "L";
    bldOrientationMap[bldOrientationCube.asString()[45]] = "B";

    for (let i = 0; i < drawCanvasStickers.length; ++i) {
        drawCanvasStickers[i].setColor("x");
    }

    findMatchingScrambles();
}

function loadSettings() {
    let savedValue = localStorage.getItem("bldOrientation");
    if (savedValue !== null) {
        bldOrientation = savedValue;
    }

    savedValue = localStorage.getItem("scramblingOrientation");
    if (savedValue !== null) {
        scramblingOrientation = savedValue;
    }

    document.getElementById('bldOrientation').value = bldOrientation;
    document.getElementById('scramblingOrientation').value = scramblingOrientation;

    setOrientation();
}

function saveSettings() {
    bldOrientation = document.getElementById('bldOrientation').value;
    scramblingOrientation = document.getElementById('scramblingOrientation').value;

    localStorage.setItem('bldOrientation', bldOrientation);
    localStorage.setItem('scramblingOrientation', scramblingOrientation);

    setOrientation();
    initDrawCanvasStickers();
}

document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
    initDrawCanvasStickers();
});

const DRAW_CANVAS_WIDTH = 600;
const MARGIN = 60;
const PGRAM_BASE_HEIGHT_SCALE = 0.5;
const STICKER_SIZE = (DRAW_CANVAS_WIDTH - 2 * MARGIN) / (9 + 3 * PGRAM_BASE_HEIGHT_SCALE);
const DRAW_CANVAS_HEIGHT = 2 * MARGIN + (3 * PGRAM_BASE_HEIGHT_SCALE + 6) * STICKER_SIZE;
const PGRAM_HEIGHT = STICKER_SIZE * PGRAM_BASE_HEIGHT_SCALE;
const PGRAM_THETA_DEG = 45;
const PGRAM_OFFSET = PGRAM_HEIGHT / Math.tan(PGRAM_THETA_DEG * (Math.PI / 180));

canvas.width = DRAW_CANVAS_WIDTH;
canvas.height = DRAW_CANVAS_HEIGHT;

let drawCanvasStickers = [];

const SELECTED_COLOR_BOX_POINTS = [
    DRAW_CANVAS_WIDTH - MARGIN,
    DRAW_CANVAS_HEIGHT - MARGIN,
    DRAW_CANVAS_WIDTH - MARGIN - 2 * STICKER_SIZE,
    DRAW_CANVAS_HEIGHT - MARGIN,
    DRAW_CANVAS_WIDTH - MARGIN - 2 * STICKER_SIZE,
    DRAW_CANVAS_HEIGHT - MARGIN - 2 * STICKER_SIZE,
    DRAW_CANVAS_WIDTH - MARGIN,
    DRAW_CANVAS_HEIGHT - MARGIN - 2 * STICKER_SIZE
]

function createDrawCanvasStickers() {
    drawCanvasStickers = [];

    // U face
    for (let row = 0; row < 3; ++row) {
        for (let col = 0; col < 3; ++col) {
            let tlx = MARGIN + 3 * STICKER_SIZE + 2 * PGRAM_OFFSET;
            let tly = MARGIN + PGRAM_HEIGHT;

            let x = tlx - row * PGRAM_OFFSET + col * STICKER_SIZE;
            let y = tly + (row * PGRAM_HEIGHT);

            let x1 = x;
            let y1 = y;
            let x2 = x + STICKER_SIZE;
            let y2 = y;
            let x3 = x + STICKER_SIZE + PGRAM_OFFSET;
            let y3 = y - PGRAM_HEIGHT;
            let x4 = x + PGRAM_OFFSET;
            let y4 = y - PGRAM_HEIGHT;

            drawCanvasStickers.push(new DrawCanvasSticker(x1, y1, x2, y2, x3, y3, x4, y4, 
                (row == 1 && col == 1 ? bldOrientationCube.asString()[0] : "x"),
                (row == 1 && col == 1))
            );
        } 
    }

    // R face
    for (let row = 0; row < 3; ++row) {
        for (let col = 0; col < 3; ++col) {
            let tlx = MARGIN + 6 * STICKER_SIZE;
            let tly = MARGIN + 3 * PGRAM_HEIGHT;

            let x = tlx + col * PGRAM_HEIGHT;
            let y = tly + (row * STICKER_SIZE) - col * PGRAM_OFFSET;

            let x1 = x;
            let y1 = y;
            let x2 = x + PGRAM_HEIGHT;
            let y2 = y - PGRAM_OFFSET;
            let x3 = x + PGRAM_HEIGHT;
            let y3 = y + STICKER_SIZE - PGRAM_OFFSET;
            let x4 = x;
            let y4 = y + STICKER_SIZE;

            drawCanvasStickers.push(new DrawCanvasSticker(x1, y1, x2, y2, x3, y3, x4, y4, 
                (row == 1 && col == 1 ? bldOrientationCube.asString()[9] : "x"), 
                (row == 1 && col == 1)
            ));
        } 
    }

    // F face
    createSquareDrawCanvasStickers(MARGIN + 3 * STICKER_SIZE, MARGIN + 3 * PGRAM_HEIGHT, bldOrientationCube.asString()[18]);

    // D face
    createSquareDrawCanvasStickers(MARGIN + 3 * STICKER_SIZE, MARGIN + 3 * PGRAM_HEIGHT + 3 * STICKER_SIZE, bldOrientationCube.asString()[27]);

    // L face
    createSquareDrawCanvasStickers(MARGIN, MARGIN + 3 * PGRAM_HEIGHT, bldOrientationCube.asString()[36]);

    // B face
    createSquareDrawCanvasStickers(MARGIN + 6 * STICKER_SIZE + 3 * PGRAM_HEIGHT, MARGIN + 3 * PGRAM_HEIGHT - 3 * PGRAM_OFFSET, bldOrientationCube.asString()[45]);
}

function createSquareDrawCanvasStickers(tlx, tly, center) {
    for (let row = 0; row < 3; ++row) {
        for (let col = 0; col < 3; ++col) {
            let x = tlx + col * STICKER_SIZE;
            let y = tly + row * STICKER_SIZE;

            let x1 = x;
            let y1 = y;
            let x2 = x + STICKER_SIZE;
            let y2 = y;
            let x3 = x + STICKER_SIZE;
            let y3 = y + STICKER_SIZE;
            let x4 = x;
            let y4 = y + STICKER_SIZE;

            drawCanvasStickers.push(new DrawCanvasSticker(x1, y1, x2, y2, x3, y3, x4, y4,
                (row == 1 && col == 1 ? center : "x"), 
                (row == 1 && col == 1)
            ));
        }
    }
}

function getMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x: x, y: y };
}

function updateDrawCanvasStickers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < drawCanvasStickers.length; ++i) {
        drawCanvasStickers[i].draw(ctx);
    }

    // draw selected color box
    ctx.beginPath();
    ctx.moveTo(SELECTED_COLOR_BOX_POINTS[0], SELECTED_COLOR_BOX_POINTS[1]);
    ctx.lineTo(SELECTED_COLOR_BOX_POINTS[2], SELECTED_COLOR_BOX_POINTS[3]);
    ctx.lineTo(SELECTED_COLOR_BOX_POINTS[4], SELECTED_COLOR_BOX_POINTS[5]);
    ctx.lineTo(SELECTED_COLOR_BOX_POINTS[6], SELECTED_COLOR_BOX_POINTS[7]);
    ctx.closePath();

    ctx.strokeStyle = 'black';
    ctx.fillStyle = STICKER_COLORS[currColor];
    ctx.fill();
    ctx.stroke();
}

function initDrawCanvasStickers() {
    createDrawCanvasStickers();
    updateDrawCanvasStickers()
}

function getDrawCanvasString() {
    let chars = [];
    for (let i = 0; i < drawCanvasStickers.length; ++i) {
        chars.push(drawCanvasStickers[i].color);
    }
    return chars.join("");
}

function handleDrawCanvasClick(event) {
    const mousePos = getMousePosition(canvas, event);
    let isClickOnCube = false;
    let isClickOnSelectedColorBox = isPointInsideShape(SELECTED_COLOR_BOX_POINTS, mousePos.x, mousePos.y);

    for (let i = 0; i < drawCanvasStickers.length; ++i) {
        let center = identityCube.asString()[9 * Math.floor(i / 9)];

        let points = [
            drawCanvasStickers[i].x1,
            drawCanvasStickers[i].y1,
            drawCanvasStickers[i].x2,
            drawCanvasStickers[i].y2,
            drawCanvasStickers[i].x3,
            drawCanvasStickers[i].y3,
            drawCanvasStickers[i].x4,
            drawCanvasStickers[i].y4,
        ];

        if (isPointInsideShape(points, mousePos.x, mousePos.y)) {
            if (drawCanvasStickers[i].isFixed) {
                currColor = bldOrientationMap[center];
            }
            else {
                drawCanvasStickers[i].setColor(currColor);
            }
            isClickOnCube = true;
            break;
        }
    }

    if (!isClickOnCube && !isClickOnSelectedColorBox) {
        currColor = "x";
    }

    updateDrawCanvasStickers();
    findMatchingScrambles();
    // console.log(getDrawCanvasString());
}

function addRows(rowsToInsert) {
    const tableBody = document.querySelector('#matchingScrambles tbody');
    tableBody.innerHTML = '';
    
    rowsToInsert.forEach(rowData => {
        const displayText = typeof rowData === 'string' ? rowData : rowData.display;
        const normalizedScramble = typeof rowData === 'string' ? fixScramble(rowData) : rowData.normalized;

        const newRow = tableBody.insertRow();
        const cell = newRow.insertCell();
        cell.textContent = displayText;
        newRow.classList.add('clickable-row');

        // display the scramble
        newRow.addEventListener('click', function() {
            initDrawCanvasStickers();

            let scramble = normalizedScramble;
            let scrambleCube = new Cube();
            console.log(scramble);
            scrambleCube.move(scramblingOrientation);
            scrambleCube.move(scramble);
            let drawCanvasString = getDrawCanvasString();
            orient(scrambleCube, drawCanvasString[4], drawCanvasString[22]);
            
            let scrambleCubeStr = scrambleCube.asString();

            for (let i = 0; i < 54; ++i) {
                drawCanvasStickers[i].setColor(scrambleCubeStr[i]);
            }

            updateDrawCanvasStickers();
        });
    });
}

function findMatchingScrambles() {
    var text = document.getElementById("multiLineInput").value;
    text = text.replace(/^\s+|\s+$/g, ""); // strip newlines
    let scrambles = text.split("\n").map(s => s.trim()).filter(x => x !== "");
    let matchingScrambles = [];

    for (let i = 0; i < scrambles.length; ++i) {
        const rawScramble = scrambles[i];
        let scramble = fixScramble(rawScramble);

        let scrambleCube = new Cube();
        scrambleCube.move(scramblingOrientation);
        scrambleCube.move(scramble);
        let drawCanvasString = getDrawCanvasString();
        orient(scrambleCube, drawCanvasString[4], drawCanvasString[22]);

        if (isOrientedCubeStringMatching(scrambleCube.asString(), drawCanvasString)) {
            matchingScrambles.push({
                display: rawScramble,
                normalized: scramble
            });
        }
    }

    addRows(matchingScrambles);
}

canvas.addEventListener('click', handleDrawCanvasClick);

var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var submitBtn = document.getElementById("submitBtn");
var howToModal = document.getElementById("howToModal");
var howToBtn = document.getElementById("howToBtn");
var bootstrapModalInstance = null;
var bootstrapHowToModalInstance = null;

if (modal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrapModalInstance = new bootstrap.Modal(modal);
}

if (howToModal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrapHowToModalInstance = new bootstrap.Modal(howToModal);
}

function showScrambleModal() {
    if (bootstrapModalInstance) {
        bootstrapModalInstance.show();
    } else if (modal) {
        modal.style.display = "block";
    }
}

function hideScrambleModal() {
    if (bootstrapModalInstance) {
        bootstrapModalInstance.hide();
    } else if (modal) {
        modal.style.display = "none";
    }
}

if (btn) {
    btn.addEventListener('click', showScrambleModal);
}

if (howToBtn) {
    howToBtn.addEventListener('click', function() {
        if (bootstrapHowToModalInstance) {
            bootstrapHowToModalInstance.show();
        }
    });
}

if (submitBtn) {
    submitBtn.addEventListener('click', function() {
        var text = document.getElementById("multiLineInput").value;
        text = text.replace(/^\s+|\s+$/g, ""); // strip newlines
        let scrambles = text.split("\n").filter(x => x !== "");
    
        alert("Entered " + scrambles.length + " scrambles");
        initDrawCanvasStickers();
        findMatchingScrambles();
        hideScrambleModal();
    });
}
