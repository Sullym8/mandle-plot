let canvas;
let ctx;
let canvasWidth;
let canvasHeight;
let imageData;
let data;
let colors = [0x000000, 0x2d5f3a, 0x48854a, 0x08352e, 0x4a6e6a, 0xd7c273, 0x012823, 0x8ead4f];

let MAX_ITERATIONS = 24;
let clickX = 0;
let clickY = 0;
let ZOOM_FACTOR = 1;
let RESOLUTION = 0.5;


const rVal = {
    start : -4,
    end : 4,
}

const iVal = {
    start : -2.25,
    end : 2.25,
}

const orig = {
    x: 0,
    y: 0,
}

class ComplexNumber {
    constructor() {
        this.Re = 0;
        this.Im = 0;
    }
    setComplex(Re,Im) {
        this.Re = Re;
        this.Im = Im;
    }
    add(c) {
        this.Re = this.Re + c.Re;
        this.Im = this.Im + c.Im;
        return this;
    }
    mul(c) {
        this.tempRe =  this.Re*c.Re - this.Im*c.Im;
        this.tempIm = this.Re*c.Im + this.Im*c.Re;
        this.Re = this.tempRe;
        this.Im = this.tempIm;
        return this;
    }
    square() {
        this.mul(this);
        return this;
    }
    magnitude() {
        return Math.pow(this.Re,2) + Math.pow(this.Im,2);
    }

}

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    imageData = ctx.createImageData(canvasWidth, canvasHeight);
    data  = imageData.data;

    draw();

    canvas.addEventListener("mousedown", function(e) {
        getMousePos(canvas,e)
        draw();
    });

}

function reset() {
    for(let i = 0; i < imageData.data.length; i += 4) {
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
        data[i+3] = 255;
    }
    rVal.start = -4;
    rVal.end = 4;
    iVal.start = -2.25;
    iVal.end = 2.25;

    orig.x = 0;
    orig.y = 0;

    ZOOM_FACTOR = 1;
    ctx.putImageData( imageData, 0, 0);
    draw();
}

function draw() {
    for(let x = -canvasWidth/2; x < canvasWidth/2; x++) {
        for (let y = -canvasHeight/2; y < canvasHeight/2; y++) {
            let z = new ComplexNumber();
            let c = new ComplexNumber();
            let n = 0;

            c.setComplex((x)*(rVal.end - rVal.start)/(canvasWidth) + orig.x, (y)*(iVal.end - iVal.start)/(canvasHeight) + orig.y);

            MAX_ITERATIONS = document.getElementById("iterationSelect").value;

            while (n < MAX_ITERATIONS && z.magnitude() <= 4) {
                z.square();
                z.add(c);
                n = n + 1;
            }
            drawPixelConvert(x,y, colors[n% 8]);
        }
    }
    drawPixelConvert(0,0,0xFFFFFF);
    document.getElementById("realInput").value = orig.x;
    document.getElementById("imaginaryInput").value = orig.y;
    ctx.putImageData(imageData, 0, 0);
}

function drawSet() {
    orig.x = Number(document.getElementById("realInput").value);
    orig.y = Number(document.getElementById("imaginaryInput").value);
    draw();
}

function zoom() {
    ZOOM_FACTOR = document.getElementById("zoomSelect").value;
    changeWindow();
    draw();
}

function drawPixelConvert(x, y, color) {
    let newX = x + canvasWidth * 1/2
    let newY = y + canvasHeight * 1/2

    drawPixel(newX, newY, color);
}

function drawPixel(x, y, color) {
    let r = (color & 0xFF0000) >> 16;
    let g = (color & 0x00FF00) >> 8;
    let b = (color & 0x0000FF);
    let a = 0xFF;

    let loc = (canvasWidth*4) * y + 4*x;
    data[loc] = r;
    data[loc + 1] = g;
    data[loc + 2] = b;
    data[loc + 3] = a;
}

function changeWindow() {
    rVal.start *= ZOOM_FACTOR;
    rVal.end *= ZOOM_FACTOR;
    iVal.start *= ZOOM_FACTOR;
    iVal.end *= ZOOM_FACTOR;
}

function getMousePos(canvas, e) {
    clickX = e.clientX - canvas.getBoundingClientRect().left - canvasWidth/2;
    orig.x += clickX * (rVal.end - rVal.start)/(canvasWidth);

    clickY = e.clientY - canvas.getBoundingClientRect().top - canvasHeight/2;
    orig.y += clickY * (iVal.end - iVal.start)/(canvasHeight);

    console.log(`(${clickX},${clickY})`);

    rVal.start += orig.x;
    rVal.end += orig.x;
    iVal.start += orig.y;
    iVal.end += orig.y;
}

function save() {
    // let image = document.getElementById("canvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
    // window.location.href = image;
}

