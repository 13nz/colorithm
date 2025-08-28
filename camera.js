// Camera class
// manages webcam capture and helpers

class Camera {
    constructor() {
        // initialize webcam
        this.cap = createCapture(VIDEO);

        // hide to show manually
        this.cap.hide();
    }

    // Return the capture so other code can use it
    getFrame() {
        return this.cap;
    }

    getCamFrame() {
        return cam && this.getFrame ? this.getFrame() : null;
    }

    camReady() {
        const f = this.getFrame();
        return !!(f && f.width && f.height);
    }

}


