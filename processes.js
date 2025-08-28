// Image manipulation processes
// groups all image operations in one class
// relies on helpers/constants from globals.js 

class Processes {

    constructor() {
        
    }


    // convolution helper
    convolution(x, y, matrix, img) {
        var matrixSize = matrix.length;
        // calculate total of each rgb value in nieghborhood and divide by size of matrix
        var totalRed = 0
        var totalGreen = 0;
        var totalBlue = 0;

        var offset = floor(matrixSize / 2)

        // loop thru neighborhood of pixels
        for (var i = 0; i < matrixSize; i++) {
            for (var j = 0; j < matrixSize; j++) {
                // pixels to change + current coordinates - offset
                var xLoc = x + i - offset;
                var yLoc = y + j - offset

                var index = (img.width * yLoc + xLoc) * 4;

                index = constrain(index, 0, img.pixels.length - 1) // make sure in bounds

                totalRed += img.pixels[index + 0] * matrix[i][j];
                totalGreen += img.pixels[index + 1] * matrix[i][j];
                totalBlue += img.pixels[index + 2] * matrix[i][j];
            }
        }

        return [totalRed, totalGreen, totalBlue];
    }

    // pixelate helper for pixel art extension
    pixelate(srcImg, blockSize = 4) {
        var outImg = createImage(CELL_W, CELL_H);
        var sizeCopy = copyToCell(srcImg);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;

        var step = Math.max(1, blockSize);

        for (var bx = 0; bx < CELL_W; bx += step) {
            for (var by = 0; by < CELL_H; by += step) {
                // avergae block color
                var sumR = 0;
                var sumG = 0;
                var sumB = 0;
                var count = 0;

                for (var x = 0; x < step && (x + bx) < CELL_W; x++) {
                    for (var y = 0; y < step && (y + by) < CELL_H; y++) {
                        var px = x + bx;
                        var py = y + by;

                        var idx = (py * CELL_W + px) * 4;

                        sumR += src[idx + 0];
                        sumG += src[idx + 1];
                        sumB += src[idx + 2];

                        count++;
                    }
                }

                // calculate average intensity
                var avgR = Math.round(sumR / count);
                var avgG = Math.round(sumG / count);
                var avgB = Math.round(sumB / count);

                // fill block with average intensity
                for (var x = 0; x < step && (x + bx) < CELL_W; x++) {
                    for (var y = 0; y < step && (y + by) < CELL_H; y++) {
                        var px = x + bx;
                        var py = y + by;

                        var idx = (py * CELL_W + px) * 4;

                        out[idx + 0] = avgR;
                        out[idx + 1] = avgG;
                        out[idx + 2] = avgB;
                        out[idx + 3] = 255;
                    }
                }

            }
        }

        outImg.updatePixels();
        return outImg;
    }


    // edge detection helper
    detectEdges(srcImg, threshold) {
        const matrixX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        const matrixY = [
            [-1, -2, -1],
            [ 0,  0,  0],
            [ 1,  2,  1]
        ];

        const W = CELL_W;
        const H = CELL_H;

        const sizeCopy = copyToCell(srcImg);
        const outImg = createImage(CELL_W, CELL_H);


        sizeCopy.loadPixels();
        outImg.loadPixels();

        var out = outImg.pixels;

        // edge detection
        for (var x = 0; x < W; x++) {
            for (var y = 0; y < H; y++) {
                var i = (y * W + x) * 4;

                var cx = this.convolution(x, y, matrixX, sizeCopy);
                var cy = this.convolution(x, y, matrixY, sizeCopy);

                // magnitude
                var mag = Math.abs(cx[0]) + Math.abs(cy[0]);

                if (mag > 1020) {
                    mag = 1020;
                }

                // scale edge gain
                var val = (mag * 255 / 1020);
                if (val < threshold) {
                    val = 0;
                }

                out[i + 0] = val;
                out[i + 1] = val;
                out[i + 2] = val;
                out[i + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }




    // -------------- Processing functions --------------

    // grayscale + brightness 20%
    processGrayscaleBright(img) {
        var sizeCopy = copyToCell(img);
        var outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        // loop through pixels
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var index = (x + y * CELL_W) * 4;

                const r = sizeCopy.pixels[index + 0];
                const g = sizeCopy.pixels[index + 1];
                const b = sizeCopy.pixels[index + 2];

                // luma calculation
                var gray = r * 0.299 + g * 0.587 + b * 0.114;

                // brightness adjustment (20%)
                gray *= 1.2;

                // make sure in bounds
                if (gray > 255) gray = 255;

                outImg.pixels[index + 0] = gray;
                outImg.pixels[index + 1] = gray;
                outImg.pixels[index + 2] = gray;
                outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }

    // color channels
    processRedChannel(srcImg) {
        var sizeCopy = copyToCell(srcImg);
        var outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        // loop through pixels
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var index = (x + y * CELL_W) * 4;

                // get only red
                const r = sizeCopy.pixels[index + 0];

                // show only red
                outImg.pixels[index + 0] = r;
                outImg.pixels[index + 1] = 0;
                outImg.pixels[index + 2] = 0;
                outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }


    processGreenChannel(srcImg) {
        var sizeCopy = copyToCell(srcImg);
        var outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        sizeCopy.loadPixels();
        outImg.loadPixels();

        // loop through pixels
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var index = (x + y * CELL_W) * 4;

                // get only green
                const g = sizeCopy.pixels[index + 1];

                // show only green
                outImg.pixels[index + 0] = 0;
                outImg.pixels[index + 1] = g;
                outImg.pixels[index + 2] = 0;
                outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }


    processBlueChannel(srcImg) {
        var sizeCopy = copyToCell(srcImg);
        var outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        sizeCopy.loadPixels();
        outImg.loadPixels();

        // loop through pixels
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var index = (x + y * CELL_W) * 4;

                // get only blue
                const b = sizeCopy.pixels[index + 2];

                // show only blue
                outImg.pixels[index + 0] = 0;
                outImg.pixels[index + 1] = 0;
                outImg.pixels[index + 2] = b;
                outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }

    // reusable process thresholds function
    processThresholdChannel(srcImg, channelIndex, val) {
        const sizeCopy = copyToCell(srcImg); 
        const outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
            const index = (y * CELL_W + x) * 4;

            const value = sizeCopy.pixels[index + channelIndex]; // 0=R,1=G,2=B
            const v = (value >= val) ? 255 : 0;

            outImg.pixels[index + 0] = channelIndex == 0 ? v : 0;
            outImg.pixels[index + 1] = channelIndex == 1 ? v : 0;
            outImg.pixels[index + 2] = channelIndex == 2 ? v : 0;
            outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();
        return outImg;
    }

    // HSV color space
    processHSV(srcImg) {
        const sizeCopy = copyToCell(srcImg); 
        const outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
            const index = (y * CELL_W + x) * 4;


            const r = sizeCopy.pixels[index + 0];
            const g = sizeCopy.pixels[index + 1];
            const b = sizeCopy.pixels[index + 2];

            var hsv = this.RGBtoHSV(r, g, b);
            var rgb  = this.HSVtoRGB(hsv[0], 1, 1); // pass only hue

            outImg.pixels[index + 0] = rgb[0];
            outImg.pixels[index + 1] = rgb[1];
            outImg.pixels[index + 2] = rgb[2];
            outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();
        return outImg;
    }


    // YCbCr color space
    processYCbCr(srcImg) {
        var sizeCopy = copyToCell(srcImg);
        var outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        // loop through pixels
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var index = (x + y * CELL_W) * 4;

                const r = sizeCopy.pixels[index + 0];
                const g = sizeCopy.pixels[index + 1];
                const b = sizeCopy.pixels[index + 2];

                var Y = 0.299 * r + 0.587 * g + 0.114 * b;
                var Cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
                var Cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

                // clamp to 255
                Y = Y < 0 ? 0 : Y > 255 ? 255: Y;
                Cb = Cb < 0 ? 0 : Cb > 255 ? 255: Cb;
                Cr = Cr < 0 ? 0 : Cr > 255 ? 255: Cr;

                outImg.pixels[index + 0] = Y;
                outImg.pixels[index + 1] = Cb;
                outImg.pixels[index + 2] = Cr;
                outImg.pixels[index + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;
    }

    // HSV helper functions
    // input: rgb, outpus: h in degrees, v, s (travis)
    RGBtoHSV(r, g, b) {
        // normalize
        r /= 255;
        g /= 255;
        b /= 255;

        var maxC = Math.max(r, g, b);
        var minC = Math.min(r, g, b);
        var d = maxC - minC;

        // saturation & value
        var v = maxC;
        var s = maxC === 0 ? 0 : d / maxC;

        // hue
        var h = 0;

        if (s !== 0) {
            var red = ( maxC - r) / d;
            var green = ( maxC - g) / d;
            var blue = ( maxC - b) / d;

            var hue;

            if (r === maxC && g === minC) {
                hue = 5 + blue;
            }
            else if (r === maxC && g !== minC) {
                hue = 1 - green;
            }
            else if (g === maxC && b === minC) {
                hue = red + 1;
            }
            else if (g === maxC && b !== minC) {
                hue = 3 - blue;
            }
            else if (b === maxC && r === minC) {
                hue = 3 + green;
            }
            else {
                hue = 5 - red;
            }

            h = (hue * 60) % 360

            if (h < 0) {
                h += 360;
            }
        }

        // return in order
        // 0-360, 0-1, 0-1
        return [h, s, v];
    }


    // covert HSV back to RGB (travis)
    HSVtoRGB(h, s, v) {
        if (s === 0) {
            var val = Math.round(v * 255);
            return [val, val, val];
        }

        var hex = h / 60;
        var primary = Math.floor(hex);
        var secondary = hex - primary;

        var A = (1 - s) * v;
        var B = (1 - (s * secondary)) * v;
        var C = (1 - (s * (1 - secondary))) * v;

        var r = 0, g = 0, b = 0;

        switch(primary) {
            case 0:
                r = v;
                g = C;
                b = A;
                break;
            case 1:
                r = B;
                g = v;
                b = A;
                break;
            case 2:
                r = A;
                g = v;
                b = C;
                break;
            case 3:
                r = A;
                g = B;
                b = v;
                break;
            case 4:
                r = C;
                g = A;
                b = v;
                break;
            case 5:
                r = v;
                g = A;
                b = B;
                break;
            default:
                break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // color space thresholds
    processHSVThreshold(srcImg, val) {
        const sizeCopy = copyToCell(srcImg), 
        outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels(); 
        outImg.loadPixels();


        for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
                const index = (y * CELL_W + x) * 4;
                const r = sizeCopy.pixels[index + 0];
                const g = sizeCopy.pixels[index + 1];
                const b = sizeCopy.pixels[index + 2];

                var [h, s, v] = this.RGBtoHSV(r, g, b); 

                if (v >= val / 255) {
                    // keep same HSV color
                    const [r, g, b] = this.HSVtoRGB(h, 1, 1);
                    outImg.pixels[index + 0] = r;
                    outImg.pixels[index + 1] = g;
                    outImg.pixels[index + 2] = b;
                } else {
                    // below threshold -> black
                    outImg.pixels[index + 0] = 0;
                    outImg.pixels[index + 1] = 0;
                    outImg.pixels[index + 2] = 0;
                }
                outImg.pixels[index + 3] = 255;
            }
        }
        outImg.updatePixels();
        return outImg;
    }



    processYCbCrThreshold(srcImg, val) {
        const sized = copyToCell(srcImg);
        const out   = createImage(CELL_W, CELL_H);

        sized.loadPixels();
        out.loadPixels();

        for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
                const idx = (y * CELL_W + x) * 4;

                const r = sized.pixels[idx + 0];
                const g = sized.pixels[idx + 1];
                const b = sized.pixels[idx + 2];

                // convert to YCbCr
                let Y  = 0.299 * r + 0.587 * g + 0.114 * b;
                let Cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
                let Cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

                // clamp
                Y  = Math.min(Math.max(Y, 0), 255);
                Cb = Math.min(Math.max(Cb, 0), 255);
                Cr = Math.min(Math.max(Cr, 0), 255);

                if (Y >= val) {
                    // keep YCbCr as RGB triplet for visualization
                    out.pixels[idx + 0] = Y;
                    out.pixels[idx + 1] = Cb;
                    out.pixels[idx + 2] = Cr;
                } else {
                    // black
                    out.pixels[idx + 0] = 0;
                    out.pixels[idx + 1] = 0;
                    out.pixels[idx + 2] = 0;
                }

                out.pixels[idx + 3] = 255;
            }
        }

        out.updatePixels();
        return out;
    }




    // face detection
    processFaceDetect(srcImg, mode = 0) {
        var faceImg = createImage(CELL_W, CELL_H);
        faceImg.copy(srcImg, 0, 0, srcImg.width, srcImg.height, 0, 0, CELL_W, CELL_H);

        // get faces
        var faces = faceDetector.detect(faceImg.canvas) || [];

        // output image
        var outImg = createImage(CELL_W, CELL_H);
        outImg.copy(faceImg, 0, 0, CELL_W, CELL_H, 0, 0, CELL_W, CELL_H);

        faceImg.loadPixels();
        outImg.loadPixels();

        for (var i = 0; i < faceImg.pixels.length; i++) {
            outImg.pixels[i] = faceImg.pixels[i];
        }

        // process modes
        if (mode !== 0) {
            for (let i = 0; i < faces.length; i++) {
                const f = faces[i]; // [x, y, w, h, conf]
                if (f[4] <= 4) continue;

                const x0 = Math.max(0, Math.floor(f[0]));
                const y0 = Math.max(0, Math.floor(f[1]));
                const x1 = Math.min(CELL_W,  Math.ceil(f[0] + f[2]));
                const y1 = Math.min(CELL_H,  Math.ceil(f[1] + f[3]));

                // two pixelated modes
                // 4 -> grayscale
                // 5 -> color
                if (mode === 4) {
                    // step 1: grayscale
                    for (var x = x0; x < x1; x++) {
                            for (var y = y0; y < y1; y++ ) {
                                const index = (y * CELL_W + x) * 4;
                                const r = outImg.pixels[index + 0];
                                const g = outImg.pixels[index + 1];
                                const b = outImg.pixels[index + 2];

                                // same logic as greyscale filter
                                let v = 0.299 * r + 0.587 * g + 0.114 * b;
                                v = Math.min(255, v * 1.2) | 0;

                                outImg.pixels[index + 0] = v;
                                outImg.pixels[index + 1] = v;
                                outImg.pixels[index + 2] = v;
                                outImg.pixels[index + 3] = 255;
                            }
                        }

                    // step 2: loop thru 5x5 blocks
                    const blockSize = 5;

                    for (var bx = x0; bx < x1; bx += blockSize) {
                        for (var by = y0; by < y1; by += blockSize) {
                            // step 3: calculate average grayscale intensity
                            var sum = 0;
                            var count = 0;

                            for (var x = 0; x < blockSize && (x + bx) < x1; x++) {
                                for (var y = 0; y < blockSize && (y + by) < y1; y++) {
                                    var px = x + bx;
                                    var py = y + by;

                                    var idx = (py * CELL_W + px) * 4;

                                    sum += outImg.pixels[idx];
                                    count++;
                                }
                            }

                            // calculate average intensity
                            var avg = Math.round(sum / count);

                            // step 4: fill block with average intensity
                            for (var x = 0; x < blockSize && (x + bx) < x1; x++) {
                                for (var y = 0; y < blockSize && (y + by) < y1; y++) {
                                    var px = x + bx;
                                    var py = y + by;

                                    var idx = (py * CELL_W + px) * 4;

                                    outImg.pixels[idx + 0] = avg;
                                    outImg.pixels[idx + 1] = avg;
                                    outImg.pixels[idx + 2] = avg;
                                    outImg.pixels[idx + 3] = 255;
                                }
                            }
                        }
                    }
                }
                else if (mode === 5) {
                    // step 2: loop thru 5x5 blocks
                    const blockSize = 5;

                    for (var bx = x0; bx < x1; bx += blockSize) {
                        for (var by = y0; by < y1; by += blockSize) {
                            // step 3: calculate average intensity for each color
                            var sumR = 0;
                            var sumG = 0;
                            var sumB = 0;

                            var count = 0;

                            for (var x = 0; x < blockSize && (x + bx) < x1; x++) {
                                for (var y = 0; y < blockSize && (y + by) < y1; y++) {
                                    var px = x + bx;
                                    var py = y + by;

                                    var idx = (py * CELL_W + px) * 4;

                                    sumR += outImg.pixels[idx + 0];
                                    sumG += outImg.pixels[idx + 1];
                                    sumB += outImg.pixels[idx + 2];

                                    count++;
                                }
                            }

                            // calculate average intensity
                            var avgR = Math.round(sumR / count);
                            var avgG = Math.round(sumG / count);
                            var avgB = Math.round(sumB / count);

                            // step 4: fill block with average intensity
                            for (var x = 0; x < blockSize && (x + bx) < x1; x++) {
                                for (var y = 0; y < blockSize && (y + by) < y1; y++) {
                                    var px = x + bx;
                                    var py = y + by;

                                    var idx = (py * CELL_W + px) * 4;

                                    outImg.pixels[idx + 0] = avgR;
                                    outImg.pixels[idx + 1] = avgG;
                                    outImg.pixels[idx + 2] = avgB;
                                    outImg.pixels[idx + 3] = 255;
                                }
                            }
                        }
                    }
                }
                else {

                    for (var x = x0; x < x1; x++) {
                        for (var y = y0; y < y1; y++ ) {
                            const index = (y * CELL_W + x) * 4;
                            const r = outImg.pixels[index + 0];
                            const g = outImg.pixels[index + 1];
                            const b = outImg.pixels[index + 2];

                            if (mode === 1) {
                                // same logic as greyscale filter
                                let v = 0.299 * r + 0.587 * g + 0.114 * b;
                                v = Math.min(255, v * 1.2) | 0;

                                outImg.pixels[index + 0] = v;
                                outImg.pixels[index + 1] = v;
                                outImg.pixels[index + 2] = v;
                                outImg.pixels[index + 3] = 255;
                            }

                            else if (mode === 2) {
                                var matrix = [
                                    [1/16, 2/16, 1/16],
                                    [2/16, 4/16, 2/16],
                                    [1/16, 2/16, 1/16]
                                ]; // sum == 1

                                var c = this.convolution(x, y, matrix, outImg);

                                outImg.pixels[index + 0] = c[0] 
                                outImg.pixels[index + 1] = c[1]
                                outImg.pixels[index + 2] = c[2]
                                outImg.pixels[index + 3] = 255
                            }
                            // YCbCr mode
                            else if (mode === 3) {
                                var Y = 0.299 * r + 0.587 * g + 0.114 * b;
                                var Cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
                                var Cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

                                // clamp to 255
                                Y = Y < 0 ? 0 : Y > 255 ? 255: Y;
                                Cb = Cb < 0 ? 0 : Cb > 255 ? 255: Cb;
                                Cr = Cr < 0 ? 0 : Cr > 255 ? 255: Cr;

                                outImg.pixels[index + 0] = Y;
                                outImg.pixels[index + 1] = Cb;
                                outImg.pixels[index + 2] = Cr;
                                outImg.pixels[index + 3] = 255;
                            }
                        }
                    }
                }
            }
        }
        

        outImg.updatePixels();

        // draw rectangles
        const ctx = outImg.drawingContext;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.fillStyle = 'rgba(240, 239, 175, 0)';

        for (let i = 0; i < faces.length; i++) {
            const f = faces[i]; // [x, y, w, h, conf]
            if (f[4] > 4) {
                ctx.strokeRect(f[0], f[1], f[2], f[3]);
                ctx.fillRect(f[0], f[1], f[2], f[3]);
            }
        }
        ctx.restore();

        outImg.loadPixels(); 
        outImg.updatePixels();
        return outImg;
    }


    // ----------------- Extension methods -------------------

    // Hue Adjustment
    processHueAdjustment(srcImg, val) {
        const sizeCopy = copyToCell(srcImg);
        const outImg = createImage(CELL_W, CELL_H);

        sizeCopy.loadPixels();
        outImg.loadPixels();


        for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
                const idx = (y * CELL_W + x) * 4;

                const r = sizeCopy.pixels[idx + 0];
                const g = sizeCopy.pixels[idx + 1];
                const b = sizeCopy.pixels[idx + 2];

                let [h, s, v] = this.RGBtoHSV(r, g, b); 
                // override hue with slider
                h = map(val, 0, 255, 0, 360);

                const [R, G, B] = this.HSVtoRGB(h, s, v);
                outImg.pixels[idx + 0] = R;
                outImg.pixels[idx + 1] = G;
                outImg.pixels[idx + 2] = B;
                outImg.pixels[idx + 3] = 255;
            }
        }

        outImg.updatePixels();
        return outImg;
    }

    // Glitch/VHS effect
    processGlitch(srcImg) {
        var rdx = 6, rdy = 0; // red offset
        var gdx = 0, gdy = 0; // green offset
        var bdx = -6, bdy = 0; // blue offset

        const sizeCopy = copyToCell(srcImg);
        const outImg = createImage(CELL_W, CELL_H);

        // clamp helper
        const clamp = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;

        // chromatic split
        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                var idx = (x + CELL_W * y) * 4;

                var rx = clamp(x + rdx, 0, CELL_W - 1);
                var gx = clamp(x + gdx, 0, CELL_W - 1);
                var bx = clamp(x + bdx, 0, CELL_W - 1);
                var ry = clamp(y + rdy, 0, CELL_H - 1);
                var gy = clamp(y + gdy, 0, CELL_H - 1);
                var by = clamp(y + bdy, 0, CELL_H - 1);

                // get index for each color
                var idxR = (ry * CELL_W + rx) * 4;
                var idxG = (gy * CELL_W + gx) * 4;
                var idxB = (by * CELL_W + bx) * 4;


                out[idx + 0] = (src[idxR + 0] ); // shifted red
                out[idx + 1] = (src[idxG + 1] ); // shifted green
                out[idx + 2] = (src[idxB + 2] ); // shifted blue

                out[idx + 3] = 255;
            }
        }

        // vertical bleed
        outImg.updatePixels();
        return outImg;

    }


    // Halation effect
    processHalation(srcImg, edgeThr = 50) {
        const matrixX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        const matrixY = [
            [-1, -2, -1],
            [ 0,  0,  0],
            [ 1,  2,  1]
        ];

        var strength = 0.7; // overall glow strength 

        // warm tint multipliers
        var warmR = 1.0;
        var warmG = 0.1;
        var warmB  = 0.1;

        const W = CELL_W;
        const H = CELL_H;

        const sizeCopy = copyToCell(srcImg);
        const outImg = createImage(CELL_W, CELL_H);

        // use helper to detect edges
        var edgeImg = this.detectEdges(srcImg);

        sizeCopy.loadPixels();
        outImg.loadPixels();
        edgeImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;
        var edge = edgeImg.pixels;


        // add halation on edges
        for (var x = 0; x < W; x++) {
            for (var y = 0; y < H; y++) {
                var i = (y * W + x) * 4;
                var edgeVal = edge[i];

                // glow mask strength
                var m = (edgeVal - edgeThr) / (255 - edgeThr);

                // normalize 0-1
                if (m < 0) {
                    m = 0;
                }
                else if (m > 1) {
                    m = 1;
                }

                m *= strength;

                var r = src[i + 0] + 255 * m * warmR;
                var g = src[i + 1] + 255 * m * warmG;
                var b = src[i + 2] + 255 * m * warmB;

                out[i + 0] = r > 255 ? 255 : r;
                out[i + 1] = g > 255 ? 255 : g;
                out[i + 2] = b > 255 ? 255 : b;

                out[i + 3] = 255;
            }
        }

        outImg.updatePixels();
        return outImg;
    }

    // 8-bit color effect
    process8bit(srcImg) {
        // reduce number of available colors per channel
        const levels = 8;
        var step = 255 / (levels - 1); // color steps per channel

        var outImg = createImage(CELL_W, CELL_H);
        var sizeCopy = copyToCell(srcImg);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;

        for (var i = 0; i < src.length; i += 4) {
            // quantize each channel
            out[i + 0] = Math.round(src[i +  0] / step) * step;
            out[i + 1] = Math.round(src[i +  1] / step) * step;
            out[i + 2] = Math.round(src[i +  2] / step) * step;

            out[i + 3] = 255;
        }


        outImg.updatePixels();
        return outImg;

    }

    // Film grain effect
    processFilmGrain(srcImg, amount = 0.08) {
        var outImg = createImage(CELL_W, CELL_H);
        var sizeCopy = copyToCell(srcImg);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;

        var scale = amount * 255;

        for (var i = 0; i < src.length; i+= 4) {
            var r = src[i + 0];
            var g = src[i + 1];
            var b = src[i + 2];

            var luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // monochrome noise [-1, 1]
            var noise = Math.random() * 2 - 1;
            var l2 = luma + noise * scale;

            // rescale rgb to keep color ratios
            var k = luma > 0 ? (l2 / luma) : 1.0;

            r = Math.max(0, Math.min(255, r * k));
            g = Math.max(0, Math.min(255, g * k));
            b = Math.max(0, Math.min(255, b * k));

            out[i + 0] = r;
            out[i + 1] = g;
            out[i + 2] = b;

            out[i + 3] = 255;
        }

        outImg.updatePixels();
        return outImg;
    }


    // Kaleidoscope effect
    processKaleidoscope(srcImg, segments = 4) {
        var outImg = createImage(CELL_W, CELL_H);
        var sizeCopy = copyToCell(srcImg);

        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;

        var cx = CELL_W / 2;
        var cy = CELL_H / 2;

        const radius = Math.min(cx, cy);
        const angle = TWO_PI / segments;

        for (var x = 0; x < CELL_W; x++) {
            for (var y = 0; y < CELL_H; y++) {
                // coords relative to center
                var dx = x - cx;
                var dy = y - cy;

                // polar coords
                var r = Math.sqrt(dx * dx + dy * dy);
                var theta = Math.atan2(dy, dx);

                // wrap and mirror
                theta = ((theta % angle) + angle) % angle;
                if (theta > angle / 2) {
                    theta = angle - theta;
                }

                // convert to cartesian coords
                var sx = Math.floor(cx + r * Math.cos(theta));
                var sy = Math.floor(cy + r * Math.sin(theta));

                // clamp in bounds
                sx = Math.max(0, Math.min(CELL_W - 1, sx));
                sy = Math.max(0, Math.min(CELL_H - 1, sy));

                var srcIdx = (sy * CELL_W + sx) * 4;
                var outIdx = (y * CELL_W + x) * 4;

                out[outIdx + 0] = src[srcIdx + 0];
                out[outIdx + 1] = src[srcIdx + 1];
                out[outIdx + 2] = src[srcIdx + 2];

                out[outIdx + 3] = 255;
            }
        }
        

        outImg.updatePixels();
        return outImg;
    }


    // Pixel art effect
    processPixelArt(srcImg, blockSize = 2, levels = 8, sample = "avg") {
        // pixelate image
        var pixelated = this.pixelate(srcImg, blockSize);

        // apply 8bit quantization
        return this.process8bit(pixelated, levels);
    }


    // Neon effect
    processNeon(srcImg) {
        // vertical neon raingow glow
        // hue varies by y 
        var outImg = createImage(CELL_W, CELL_H);
        var sizeCopy = copyToCell(srcImg);

        var edgeThreshold = 80;
        var strength = 2;
        var sat = 0.35;
        var bright = 1.0;
        var gamma = 1.5;

        // edge detection
        var edges = this.detectEdges(sizeCopy, edgeThreshold);

        sizeCopy.loadPixels();
        outImg.loadPixels();
        edges.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;
        var epx = edges.pixels;

        var W = CELL_W;
        var H = CELL_H;
        



        for (var y = 0; y < H; y++) {
            // pastel rainbow colors
            var h = (y / (H - 1)) * 360;
            var [rC, gC, bC] = this.HSVtoRGB(h, sat, bright);

            for (var x = 0; x < W; x++) {
                var i = (y * W + x) * 4;

                // scale edges mask by strength
                var m = (epx[i] / 255);
                m = Math.pow(m, gamma) * strength;

                // clamp m
                if (m < 0.001) {
                    m = 0;
                }

                if (m > 1) {
                    m = 1;
                }

                // assign pixels
                out[i + 0] = rC * m;
                out[i + 1] = gC * m;
                out[i + 2] = bC * m;

                out[i + 3] = 255;
            }
        }

        outImg.updatePixels();

        return outImg;

    }


    // Film emulation effect
    processFilmEmulation(srcImg, wb = 50) {
        // white balance
        // 128: neutral
        // wb > 128: warm
        // wb < 128: cool

        // map wb to -1...+1
        wb = map(wb, 0, 255, -1, 1);

        const sizeCopy = copyToCell(srcImg);
        const outImg = createImage(CELL_W, CELL_H);


        sizeCopy.loadPixels();
        outImg.loadPixels();

        var src = sizeCopy.pixels;
        var out = outImg.pixels;
    
        // channel gains
        var rGain;
        var gGain;
        var bGain;

        if (wb >= 0) {
            // warm - increase red + green
            rGain = 1 + 0.25 * wb;
            gGain = 1 + 0.1 * wb;
            bGain = 1 - 0.2 * wb;
        }
        else {
            // cool - increase blue
            rGain = 1 + 0.25 * wb;   
            gGain = 1 + 0.1 * wb;  
            bGain = 1 - 0.2 * wb; 
        }

        // process white balance
        for (var i = 0; i < src.length; i += 4) {
            var r = src[i + 0] * rGain;
            var g = src[i + 1] * gGain;
            var b = src[i + 2] * bGain;

            // clamp 
            out[i + 0] = r > 255 ? 255 : r < 0 ?  0 : r;
            out[i + 1] = g > 255 ? 255 : g < 0 ?  0 : g;
            out[i + 2] = b > 255 ? 255 : b < 0 ?  0 : b;

            out[i + 3] = 255;
        }

        outImg.updatePixels();

        // apply halation
        var halation = this.processHalation(outImg);

        // apply grain
        var grain = this.processFilmGrain(halation);
        

        return grain;
    }
}
