// SKETCH

// uses constants from globals.js
// depends on Camera class (camera.js) and Processes class (processes.js)

// camera and processes declaration
let cam;
let proc;

let snapshot = null;



// processed images
let grayscaleBrightnessImg;

let redChannelImg;
let greenChannelImg;
let blueChannelImg;

let redThresholdImg;
let greenThresholdImg;
let blueThresholdImg;

let hsvImg;
let ycbcrImg;

let hsvThresholdImg;
let YCbCrThresholdImg;

let faceDetectImg;

let hueImg;
let glitchImg;
let neonImg;
let eightBitImg;
let pixelArtImg;
let kaleidoscopeImg;
let filmGrainImg;
let halationImg;
let filmEmulationImg;



// sliders
let redThresholdSlider, greenThresholdSlider, blueThresholdSlider;
let hsvThresholdSlider, YCbCrThresholdSlider;
let hueAdjustSlider, wbSlider, grainSlider, halationSlider;
let sliders = [];



// face mode 0 - 5
let faceReplaceMode = 0;



// canvas ref for accurate slider hit testing
let cnv;



function setup() {
    cnv = createCanvas(windowWidth, windowHeight);
    pixelDensity(1);

    cam = new Camera();


    if (typeof objectdetect !== "undefined") {
        faceDetector = new objectdetect.detector(CELL_W, CELL_H, 1.2, objectdetect.frontalface);
    }

    proc = new Processes();



    // sliders
    redThresholdSlider   = createSlider(0, 255, 120);
    greenThresholdSlider = createSlider(0, 255, 120);
    blueThresholdSlider  = createSlider(0, 255, 120);

    hsvThresholdSlider   = createSlider(0, 255, 120);
    YCbCrThresholdSlider = createSlider(0, 255, 120);

    hueAdjustSlider = createSlider(0, 255, 120);
    wbSlider        = createSlider(0, 255, 128);
    grainSlider     = createSlider(0, 10, 5);
    halationSlider  = createSlider(0, 100, 50);



    sliders = [
        redThresholdSlider, greenThresholdSlider, blueThresholdSlider,
        hsvThresholdSlider, YCbCrThresholdSlider,
        hueAdjustSlider, wbSlider, grainSlider, halationSlider
    ];



    // reactive reprocessing (only runs if a snapshot exists)
    redThresholdSlider.input(reprocessThresholds);
    greenThresholdSlider.input(reprocessThresholds);
    blueThresholdSlider.input(reprocessThresholds);

    hsvThresholdSlider.input(reprocessColorSpaceThresholds);
    YCbCrThresholdSlider.input(reprocessColorSpaceThresholds);

    hueAdjustSlider.input(() => { if (snapshot) hueImg = proc.processHueAdjustment(snapshot, hueAdjustSlider.value()); });
    wbSlider.input(() => { if (snapshot) filmEmulationImg = proc.processFilmEmulation(snapshot, wbSlider.value()); });
    grainSlider.input(() => { if (snapshot) filmGrainImg = proc.processFilmGrain(snapshot, grainSlider.value() / 100); });
    halationSlider.input(() => { if (snapshot) halationImg = proc.processHalation(snapshot, halationSlider.value()); });



    positionSliders();
}



function draw() {
    background(45, 68, 89);

    // main grid background
    noStroke();
    fill(106, 122, 125);
    rect(12, 12, GRID_W, GRID_H, 12);



    // rows 1 - 5
    drawCell(0, 0, "webcam", cam.camReady() ? cam.getFrame() : null);
    drawCell(1, 0, "grayscale & brightness", grayscaleBrightnessImg);
    drawCell(2, 0, "click or press space \n to take snapshot");

    drawCell(0, 1, "red channel",   redChannelImg);
    drawCell(1, 1, "green channel", greenChannelImg);
    drawCell(2, 1, "blue channel",  blueChannelImg);

    drawCell(0, 2, "threshold image", redThresholdImg);
    drawCell(1, 2, "threshold image", greenThresholdImg);
    drawCell(2, 2, "threshold image", blueThresholdImg);

    drawCell(0, 3, "snapshot", snapshot);
    drawCell(1, 3, "hsv color space",   hsvImg);
    drawCell(2, 3, "ycbcr color space", ycbcrImg);

    drawCell(0, 4, "face detection", faceDetectImg);
    drawCell(1, 4, "threshold image color space 1", hsvThresholdImg);
    drawCell(2, 4, "threshold image color space 2", YCbCrThresholdImg);



    // extension grid background
    noStroke();
    fill(106, 122, 125);
    rect(4 * 12 + GRID_W, 12, GRID_W_E, GRID_H_E, 12);

    drawCell(0, 0, "hue adjustment", hueImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(1, 0, "glitch",         glitchImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(2, 0, "neon",           neonImg, E_ORIGIN_X, E_ORIGIN_Y);

    drawCell(0, 1, "8-bit color",  eightBitImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(1, 1, "pixel art",    pixelArtImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(2, 1, "kaleidoscope", kaleidoscopeImg, E_ORIGIN_X, E_ORIGIN_Y);

    drawCell(0, 2, "grain",           filmGrainImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(1, 2, "halation",        halationImg, E_ORIGIN_X, E_ORIGIN_Y);
    drawCell(2, 2, "film emulation",  filmEmulationImg, E_ORIGIN_X, E_ORIGIN_Y);



    // if (!camReady() && cam && cam.drawErrorBanner) {
    //     cam.drawErrorBanner(MARGIN, GRID_H + MARGIN * 2, GRID_W - MARGIN * 2);
    // }

}


// positions sliders on the grid
function positionSliders() {
    const row3y = MARGIN + 2 * (CELL_H + GAP) + CELL_H;

    redThresholdSlider.position(MARGIN, row3y);
    greenThresholdSlider.position(MARGIN + (CELL_W + GAP), row3y);
    blueThresholdSlider.position(MARGIN + 2 * (CELL_W + GAP), row3y);

    const row5y = MARGIN + 4 * (CELL_H + GAP) + CELL_H;

    hsvThresholdSlider.position(MARGIN + (CELL_W + GAP), row5y);
    YCbCrThresholdSlider.position(MARGIN + 2 * (CELL_W + GAP), row5y);

    const extY1 = MARGIN + CELL_H;
    const extY2 = MARGIN + CELL_H + 2 * (CELL_H + GAP);

    hueAdjustSlider.position(E_ORIGIN_X, extY1);
    halationSlider.position(E_ORIGIN_X + (CELL_W + GAP), extY2);
    wbSlider.position(E_ORIGIN_X + 2 * (CELL_W + GAP), extY2);
    grainSlider.position(E_ORIGIN_X, extY2);
}



function mousePressed() {
    if (mouseOnSliders()) return;
    takeSnapshot();
}



// translate canvas coords to page coords before testing slider 
function mouseOnSliders() {
    const cbox = cnv.elt.getBoundingClientRect();

    const pageX = mouseX + cbox.left;
    const pageY = mouseY + cbox.top;

    for (let s of sliders) {
        const r = s.elt.getBoundingClientRect();
        if (pageX >= r.left && pageX <= r.right && pageY >= r.top && pageY <= r.bottom) {
            return true;
        }
    }

    return false;
}



function keyPressed() {
    if (key === ' ') {
        takeSnapshot();

    } else if (key >= '0' && key <= '5') {
        faceReplaceMode = int(key);
        if (snapshot) faceDetectImg = proc.processFaceDetect(snapshot, faceReplaceMode);
    }
}


// takes picture
function takeSnapshot() {
    if (!cam.camReady()) return;

    const frame = cam.getFrame();

    if (!snapshot) {
        snapshot = createImage(frame.width, frame.height);
    }

    snapshot.copy(
        frame,
        0, 0,
        frame.width, frame.height,
        0, 0,
        snapshot.width, snapshot.height
    );

    reprocessAll();
}


// reprocess when state changes
function reprocessAll() {
    if (!snapshot) return;

    // main grid
    grayscaleBrightnessImg = proc.processGrayscaleBright(snapshot);

    redChannelImg   = proc.processRedChannel(snapshot);
    greenChannelImg = proc.processGreenChannel(snapshot);
    blueChannelImg  = proc.processBlueChannel(snapshot);

    redThresholdImg   = proc.processThresholdChannel(snapshot, 0, redThresholdSlider.value());
    greenThresholdImg = proc.processThresholdChannel(snapshot, 1, greenThresholdSlider.value());
    blueThresholdImg  = proc.processThresholdChannel(snapshot, 2, blueThresholdSlider.value());

    hsvImg   = proc.processHSV(snapshot);
    ycbcrImg = proc.processYCbCr(snapshot);

    faceDetectImg = proc.processFaceDetect(snapshot, faceReplaceMode);

    // extension grid
    hueImg           = proc.processHueAdjustment(snapshot, hueAdjustSlider.value());
    glitchImg        = proc.processGlitch(snapshot);
    neonImg          = proc.processNeon(snapshot, 50);
    eightBitImg      = proc.process8bit(snapshot);
    pixelArtImg      = proc.processPixelArt(snapshot, 2);
    kaleidoscopeImg  = proc.processKaleidoscope(snapshot);
    filmGrainImg     = proc.processFilmGrain(snapshot, grainSlider.value() / 100); // adjust value
    halationImg      = proc.processHalation(snapshot, halationSlider.value());
    filmEmulationImg = proc.processFilmEmulation(snapshot, wbSlider.value());

    // color space thresholds last so they reflect current sliders
    hsvThresholdImg   = proc.processHSVThreshold(snapshot,   hsvThresholdSlider.value());
    YCbCrThresholdImg = proc.processYCbCrThreshold(snapshot, YCbCrThresholdSlider.value());
}



function reprocessThresholds() {
    if (!snapshot) return;

    redThresholdImg   = proc.processThresholdChannel(snapshot, 0, redThresholdSlider.value());
    greenThresholdImg = proc.processThresholdChannel(snapshot, 1, greenThresholdSlider.value());
    blueThresholdImg  = proc.processThresholdChannel(snapshot, 2, blueThresholdSlider.value());
}



function reprocessColorSpaceThresholds() {
    if (!snapshot) return;

    hsvThresholdImg   = proc.processHSVThreshold(snapshot,   hsvThresholdSlider.value());
    YCbCrThresholdImg = proc.processYCbCrThreshold(snapshot, YCbCrThresholdSlider.value());
}
