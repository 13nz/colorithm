/**
 * COMMENTARY
 * 
 * This project implements image processing using the user's webcam and a snapshot buffer image, using p5.js, and OOP principles.
 * Each processed image is displayed on a grid of cells, each running a self contained pixel processing function.
 * These include a grayscale process, color channels, color channels with threshold sliders, conversion to HSV color space, conversion to
 * YCbCr color space, face detection, and the above color spaces with threshold sliders.
 * The face detection process includes grayscale mode, blur, YCbCr conversion, gray pixelation, and color pixelation, which can be toggled with 
 * keys 1-5, and 0 for the default.
 * The user can take a snapshot using the spacebar or clicking anywhere on the canvas. 
 * 
 * Findings
 * Thresholding by color behaves differently depending on the color. The red channel has more red than black when using the same value as the other colors, and makes
 * brighter areas and skin more visible. The green channel responds better to luminance, and the blue is noisier, and responds better to shadows and cooler areas.
 * Using thresholds with color converted images behaves differently as well. The YCbCr image has more detail and more black than the HSV. The HSV also produces 
 * more noise and the areas where the colors change look a lot more harsh.
 * 
 * Problems & resolutions
 * Webcam freeze after snapshot: after taking a snapshot the webcam view freezes and keeping a live view wasn't possible, so I kept the unedited picture in place of
 * the webcam
 * Face detection pixelation: I kept all the face detection processing in one function and the pixelation one was causing the progrm to freeze due to all the 
 * nested loops required. Resolved by moving the pixelation logic in an outside loop 
 * Sliders retaking snapshot: Because the user can take a snapshot by clicking on the canvas, adjusting the sliders caused the application to retake the picture each time. 
 * Resolved by creating a method that checks if the  mouse click happened in the area of each slider, and only takes the snapshot if the return value is false. 
 * All the sliders are saved in a global sliders array so the check can be done in one loop, without checking each one manually.
 * 
 * Schedule
 * I managed to implement all the project requirements and the extensions before the deadline. However, if I had more time, I would add a few more extensions (I'd like
 * to add a heatmap and a double exposure effect), a visual debug mode to avoid printing when having issues, and I would organize my code to make it more modular
 * and have more reusable helper functions. A lot of the processes use the same loops and this could be done outside the actual pixel manipulation.
 * 
 * Extensions
 * I have added 9 extensions to the project. They are placed on a grid to the right of the one with the required processes. 
 * The extensions are:
 * 1. Hue adjustment: produces a monochromatic picture, with the color being adjusted using a slider. I accidentally figured out
 * this logic while attempting the color space conversion and decided to keep it as an extension.
 * 2. Glitch effect: splits the image color channels horizontally to create a colorful glitch effect 
 * 3. Neon glow: Using the edge detection process from the lectures, the image is turned black except the edges, which have a pastel rainbow neon effect, 
 * changing colors vertically.
 * 4. 8-bit color: Reduces the colors of each channel in the image to a more constrained palette, similar to old video games. 
 * 5. Pixel Art: Applies pixelization (similar to the face detection filter) to the image, and reuses the 8-bit color process to create the effect of old 
 * school pixel art video games.
 * 6. Kaleidoscope: Transforms image into polar coordinates, mirrors, and converts back to cartesian coordinates, to produce a symmetrical
 * kaleidoscope pattern
 * 7. Film Grain: adds monochrome noise across the image to simulate the texture of film grain.
 * 8. Halation: detects edges and adds a warm red glow, like the halation effect seen in certain kinds of film stock when capturing highlights.
 * 9. Film Emulation: a compination of the grain and halation processes, with an added slider for white balance, to simulate the look of analog film photographs.
 * 
 * 
 */


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
