import { startInputEvents } from "./input.js";
import { Vector2 } from "./math.js";
import { preloadImages } from "./preload.js"

class GameSettings {
    constructor() {
        this.width;
        this.height;
        this.canvasScale;

        this.mousePos = new Vector2();
        
        this.textures;

        // Filter to disable anti-aliasing
        this.aliasingFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#f')`
        
        this.layers = {};
        this.tempCanvas = [];
        this.state = "init";

        this.gameCanvas = null;
        this.inputCanvas = null;

        this.data = {};

        this.timeScale = 1;
    }

    createWindow(w, h, scale) {
        [this.width, this.height, this.canvasScale] = [w, h, scale];
    
        // Input events need this first canvas layer to operate.
        const layersDiv = document.getElementById('layers');
        this.inputCanvas = this.createCanvas(999);
        this.gameCanvas = this.createCanvas(0);
        layersDiv.appendChild(this.inputCanvas);
        layersDiv.appendChild(this.gameCanvas);

        startInputEvents();
    
        let style = document.createElement('style');
        style.textContent = `
            canvas {
                position: absolute;
                scale: ${this.canvasScale};
                image-rendering: pixelated;
                font-smooth: never;
                -webkit-font-smoothing: none;
            }
        `;
        document.head.appendChild(style);
    
        return true;
    }

    createCanvas(zIndex) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = this.width * this.canvasScale;
        canvas.style.height = this.height * this.canvasScale;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = zIndex;

        return canvas
    }

    addLayer(layerName, zIndex, antialiasing = false, imageSmoothing = false) {
        const canvas = this.createCanvas(zIndex);
        const context = canvas.getContext("2d");
        
        // Make pixel art sprites crisper when scaling and rotating.
        context.imageSmoothingEnabled = imageSmoothing;
    
        if (!antialiasing) {
            context.filter = this.aliasingFilter;
        }
    
        this.layers[layerName] = context;
        this.tempCanvas.push(canvas);
    }

    setState(newState) {
        this.state = newState;
    }

    async preloadAll(urls) {
        this.textures = await preloadImages(urls);
    }

    render() {
        if (this.tempCanvas.length === 0) {
            console.log("No layers created");
        }

        this.gameCanvas.getContext("2d").clearRect(0, 0, this.width, this.height);

        for (const canvas of this.tempCanvas) {
            this.gameCanvas.getContext("2d").drawImage(canvas, 0, 0);
        }
    }

    clearAll() {
        if (this.tempCanvas.length === 0) {
            console.log("No layers created");
        }

        for (const canvas of this.tempCanvas) {
            canvas.getContext("2d").clearRect(0, 0, this.width, this.height);
        }

        this.gameCanvas.getContext("2d").clearRect(0, 0, this.width, this.height);
    }

    setTimeScale(newScale) {
        this.timeScale = newScale;
    }

    takeScreenshot() {
        // Create a temporary link element
        var link = document.createElement('a');
      
        // Get the data URL of the canvas
        var dataURL = this.gameCanvas.toDataURL('image/png');
      
        // Set the href attribute of the link to the data URL
        link.href = dataURL;
      
        // Set the download attribute with a desired filename
        link.download = 'screenshot.png';
      
        // Append the link to the document
        document.body.appendChild(link);
      
        // Trigger a click event on the link to initiate the download
        link.click();
      
        // Remove the link from the document
        document.body.removeChild(link);
      }
      
}

export let Game = new GameSettings();