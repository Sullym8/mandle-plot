let canvas;
let canvasPreview;
let ctx;
let ctxPreview;
let canvasWidth;
let canvasHeight;
let imageData;
let data;
let colors = [];
let NUM_COLOR = 2;
// let colors = [0x000000, 0x2d5f3a, 0x48854a, 0x08352e, 0x4a6e6a, 0xd7c273, 0x012823, 0x8ead4f];

let MAX_ITERATIONS = 24;
let clickX = 0;
let clickY = 0;
let ZOOM_FACTOR = 1;
let RESOLUTION = 0;

let color_partition = 16;

const rVal = {
    start : -2,
    end : 2,
}

const iVal = {
    start : -1.125,
    end : 1.125,
}

const orig = {
    x: -1,
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

class Color {
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.str = "#00000000";
    }

    generateColor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.str = this.generateString();
    }

    generateColorFromString(colorString){
        let hexCode = parseInt(colorString.substring(1),16);

        this.blue = (hexCode & 0x0000FF);
        this.green = (hexCode & 0x00FF00) >> 8;
        this.red = (hexCode & 0xFF0000) >> 16;
        this.str = colorString;
    }

    generateString() {
        return "#" + this.red.toString(16).padStart(2,"0") + this.green.toString(16).padStart(2,"0") + this.blue.toString(16).padStart(2,"0");
    }
}

let colorGrad1;
let colorGrad2;

function init() {
    canvas = document.getElementById("canvas");
    canvasPreview = document.getElementById("gradientPreview");
    ctx = canvas.getContext("2d");
    ctxPreview = canvasPreview.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    colorGrad1 = new Color();
    colorGrad2 = new Color();
    
    imageData = ctx.createImageData(canvasWidth, canvasHeight);
    data  = imageData.data;

    gradient();

    canvas.addEventListener("mousedown", function(e) {
        getMousePos(canvas,e)
        draw();
    });

    document.getElementById("resMul").addEventListener("input", function(e) {
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

    orig.x = -1;
    orig.y = 0;

    ZOOM_FACTOR = 1;
    ctx.putImageData( imageData, 0, 0);
    draw();
}

function draw() {
    console.log(colors)
    RESOLUTION = parseFloat(document.getElementById("resMul").value);
    for(let x = -RESOLUTION * canvasWidth/2; x < RESOLUTION * canvasWidth/2; x++) {
        for (let y = -RESOLUTION * canvasHeight/2; y < RESOLUTION * canvasHeight/2; y++) {
            let z = new ComplexNumber();
            let c = new ComplexNumber();
            let n = 0;

            c.setComplex((x)*(rVal.end - rVal.start)/(RESOLUTION * canvasWidth) + orig.x, (y)*(iVal.end - iVal.start)/(RESOLUTION * canvasHeight) + orig.y);

            MAX_ITERATIONS = document.getElementById("iterationSelect").value;

            while (n < MAX_ITERATIONS && z.magnitude() <= 4) {
                z.square();
                z.add(c);
                n = n + 1;
            }
            drawPixelConvert(x,y, colors[n % MAX_ITERATIONS]);
            // drawPixelConvert(x,y, colors[0]);
        }
    }

    document.getElementById("realInput").value = orig.x;
    document.getElementById("imaginaryInput").value = orig.y;
    ctx.putImageData(imageData, 0, 0);
    ctx.drawImage(canvas, 0, 0, (1/RESOLUTION)*canvas.width, (1/RESOLUTION)*canvas.height );   
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
    let newX = x + canvasWidth * 1/2 * RESOLUTION;
    let newY = y + canvasHeight * 1/2 * RESOLUTION;
    drawPixel(newX, newY, color);
}

function drawPixel(x, y, color) {
    let loc = (canvasWidth*4) * y + 4*x;

    data[loc] = color.red;
    data[loc + 1] = color.green;
    data[loc + 2] = color.blue;
    data[loc + 3] = 255;
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

    rVal.start += orig.x;
    rVal.end += orig.x;
    iVal.start += orig.y;
    iVal.end += orig.y;
}

function save() {
    // let image = document.getElementById("canvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
    // window.location.href = image;
}

function gradient() {
    colors = [];
    colors.push(new Color());
    MAX_ITERATIONS = document.getElementById("iterationSelect").value;

    for(let i = 1; i <= (NUM_COLOR - 1); i++) {
        // console.log(document.getElementById("color"+i).value);
        colorGrad1.generateColorFromString(document.getElementById("color"+i).value);
        colorGrad2.generateColorFromString(document.getElementById("color"+(i+1)).value);

        let colorsPerPartition = MAX_ITERATIONS/(NUM_COLOR - 1);
        console.log(colorsPerPartition);

        // while(j < )

        // for (let j = 0; j < 1; j += 1/((NUM_COLOR - 1) * MAX_ITERATIONS)) {
        for (let j = 0; j < colorsPerPartition; j++) {
            let tempCol = new Color();
            let r = Math.trunc(colorGrad1.red + (colorGrad2.red - colorGrad1.red)*(j/colorsPerPartition));
            let g = Math.trunc(colorGrad1.green + (colorGrad2.green - colorGrad1.green)*(j/colorsPerPartition));
            let b = Math.trunc(colorGrad1.blue + (colorGrad2.blue - colorGrad1.blue)*(j/colorsPerPartition));
            tempCol.generateColor(r,g,b);
            // console.log(tempCol);
            colors.push(tempCol);
        }
    }

    // console.log(colorGrad1);
    // console.log(colorGrad2);

    // let hexCode1 = parseInt(document.getElementById("color1").value.substring(1),16);
    // let hexCode2 = parseInt(document.getElementById("color2").value.substring(1),16);

    // color1.B = (hexCode1 & 0x0000FF);
    // color1.G = (hexCode1 & 0x00FF00) >> 8;
    // color1.R = (hexCode1 & 0xFF0000) >> 16;
    
    // color2.B = (hexCode2 & 0x0000FF);
    // color2.G = (hexCode2 & 0x00FF00) >> 8;
    // color2.R = (hexCode2 & 0xFF0000) >> 16;

    

    generatePalletPrev();
    draw();
}

function generatePalletPrev() {
    let grad = ctxPreview.createLinearGradient(0,0,canvasPreview.width,canvasPreview.height);
    // for(let i = 0; i <= (NUM_COLOR - 1); i++) {
    //     let str = "color" + (i + 1);
    //     grad.addColorStop(i * (1/NUM_COLOR), document.getElementById(str).value);
    // }
    for(let i = 0; i < colors.length; i++) {
        grad.addColorStop(i * (1/colors.length), colors[i].str);
    }
    // grad.addColorStop(0, colorGrad1.generateString());
    // grad.addColorStop(1, colorGrad2.generateString());

    ctxPreview.fillStyle = grad;
    ctxPreview.fillRect(0,0,canvasPreview.width,canvasPreview.height);
}

function addColor() {
    NUM_COLOR++;
    let newColorDiv = document.createElement("div");
    newColorDiv.id = "colorDiv" + NUM_COLOR;
    newColorDiv.classList.add("col");
    document.getElementById("colorRow").appendChild(newColorDiv);
    let newColorPicker = document.createElement("input");
    newColorPicker.classList.add("form-control")
    newColorPicker.type = "color";
    newColorPicker.id = "color" + NUM_COLOR;
    document.getElementById("colorDiv" + NUM_COLOR).appendChild(newColorPicker);
    
}