// Globals
// holds shared constants and tiny helpers

// grid + layout
const CELL_W = 160;
const CELL_H = 120;
const ROWS = 5;
const COLS = 3;
const GAP = 24;
const MARGIN = 32;

// computed dimensions for main grid
const GRID_W = MARGIN * 2 + COLS * CELL_W + (COLS - 1) * GAP - 12;
const GRID_H = MARGIN * 2 + ROWS * CELL_H + (ROWS - 1) * GAP - 12;

// extensions grid
const ROWS_E = 3;
const COLS_E = 3;
const GRID_W_E = MARGIN * 2 + COLS_E * CELL_W + (COLS_E - 1) * GAP - 12;
const GRID_H_E = MARGIN * 2 + ROWS_E * CELL_H + (ROWS_E - 1) * GAP - 12;
const E_ORIGIN_X = MARGIN + GRID_W_E + 40;
const E_ORIGIN_Y = MARGIN;

// face detector assigned in setup 
let faceDetector = null;

// utility to draw a cell with a border, optional image or text
function drawCell(col, row, label, img, originX, originY) {
    originX = originX == null ? MARGIN : originX;
    originY = originY == null ? MARGIN : originY;

    const x = originX + col * (CELL_W + GAP);
    const y = originY + row * (CELL_H + GAP);

    // border
    stroke(222, 210, 164);
    strokeWeight(3);
    noFill();
    rect(x, y, CELL_W, CELL_H, 6);

    if (img) {
        image(img, x, y, CELL_W, CELL_H);
    } else if (label) {
        noStroke();
        fill(30);
        textAlign(CENTER, CENTER);
        text(label, x + CELL_W / 2, y + CELL_H / 2);
    }
}

// copies any p5 image or video frame into a new image sized to a grid cell
function copyToCell(srcImg) {
    const outImg = createImage(CELL_W, CELL_H);
    outImg.copy(
        srcImg,
        0, 0,
        srcImg.width, srcImg.height,
        0, 0,
        CELL_W, CELL_H
    );
    return outImg;
}
