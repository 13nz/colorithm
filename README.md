# 🎨 Image Processing

**Image Processing** is an interactive browser-based application that applies real-time filters, transformations, and special effects to images and snapshots.  
It features a grid-based interface for selecting different modes, face detection filters, and creative extensions — all running in the browser with JavaScript and p5.js.  

---

## 🚀 Features

### 🖼 Core Processing Modes
- **Grayscale** – Standard luminance conversion.  
- **Blur** – Convolution-based Gaussian blur.  
- **Color Channels** – Isolates RGB color channels  
- **HSV Color Space** – Converts colors into HSV representation.  
- **YCbCr Color Space** – Converts colors into YCbCr representation.  
- **Face Detection** – Detects faces in the image and applies filters to them.

### 🎯 Extensions
- **Hue Adjustment** – Slider-based color rotation.  
- **Glitch / VHS** – RGB channel splitting for retro distortion.  
- **Neon Edges** – Edge detection with rainbow highlights.  
- **8-bit Color** – Quantizes color values for retro pixel-art look.  
- **Pixel Art Filter** – Pixelates and reduces colors for a low-res aesthetic.  
- **Kaleidoscope** – Radial symmetry based on angular mirroring.  
- **Film Grain** – Adds monochrome random noise for texture.  
- **Halation** – Red glow on bright edges, simulating film optics.  
- **Film Emulation** – Combines halation, grain, and white balance adjustment.

---

## 🛠 Technologies Used
- **[p5.js](https://p5js.org/)** – Drawing, image manipulation, and creative coding.  
- **objectdetect.js** – Detects faces and applies targeted effects.  
- **JavaScript (ES6)** – Logic and processing functions.  
- **HTML5 Canvas** – Rendering and real-time pixel manipulation.  

---

## 🔬 Processing Techniques
- **Convolution Filters** – Used for blur, edge detection, and halation.  
- **Color Space Conversions** – RGB ↔ YCbCr transformations.  
- **Pixel Manipulation** – Direct reading and writing of pixel arrays.  
- **Quantization** – Reducing color depth for retro and 8-bit styles.  
- **Polar Coordinates** – For kaleidoscope transformations.  
- **Block Averaging** – Pixelation effects.  
- **Procedural Noise** – Grain generation.  
- **Edge Detection** – Sobel operator for highlights and neon effects.  

---

## 🧠 Processing Techniques Explained

### Convolution Filters
Convolution applies a **matrix kernel** to each pixel and its neighbors, producing effects such as blur, sharpening, or edge detection.  
Example: Gaussian blur softens edges by averaging nearby pixels.

### Sobel Edge Detection
The Sobel operator detects edges by finding intensity gradients. Two matrices (`matrixX` and `matrixY`) are used to detect horizontal and vertical edges, and their results are combined to get edge magnitude.

### Color Quantization
Quantization reduces the number of colors by mapping each pixel to the nearest value in a limited palette — creating retro “8-bit” effects.

### Pixelation
Pixels are grouped into blocks (e.g., 5×5). Each block’s average color is calculated and applied to all pixels in that block, producing a low-resolution, blocky look.

### Color Space Conversion
Converting RGB to **YCbCr** separates brightness (Y) from color information (Cb, Cr), enabling certain styles like chroma manipulation.

### Grain / Noise
Adds randomness to pixel intensity or color values to simulate film grain, creating texture and analog feel.

### Kaleidoscope
Uses **polar coordinates** to rotate and mirror pixel positions, creating symmetrical patterns radiating from the image center.

---

## 📷 How It Works
- The app loads the webcam and captures a snapshot.  
- Images are drawn into a grid of cells.  
- Each cell applies a different processing method.  
- Users can toggle between effects using keys or click-based interactions.  
- Sliders allow real-time parameter control for certain effects.  

---

## ▶️ Running the Project
Press SPACE or click anywhere to take or retake a snapshot. Use the sliders to adjust values. Press S to save.

---

## 📄 License
MIT License. Feel free to use and modify.
