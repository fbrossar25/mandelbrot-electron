function scaledPixelCoordinates(x,y,ZOOM_FACTOR,OFFSET={x:0,y:0}){
    return {
        x: x / ZOOM_FACTOR - OFFSET.x,
        y: y / ZOOM_FACTOR - OFFSET.y
    };
}

function addComplex(A,B){
    return {x:A.x+B.x, y:A.y+B.y};
}

function mulComplex(A,B){
    return {
        x:(A.x*B.x - A.y*B.y),
        y:(A.x*B.y + A.y*B.x)
    };
}

function checkDivergency(A, ESCAPE){
    return (A.x*A.x) + (A.y*A.y) > ESCAPE;
}

function isInMandelbrotSet(C, ITERATIONS, ESCAPE) {
    let Zprevious = {x:C.x,y:C.y};
    let Z = {x:0, y:0};
    for(let i = 0; i < ITERATIONS; i++) {
        Z = addComplex(mulComplex(Zprevious, Zprevious),C);
        if (checkDivergency(Z, ESCAPE)){
            return i;
        }
        Zprevious = {x: Z.x, y:Z.y};
    }
    return ITERATIONS;
}

function setPixel(x,y,img,color){
    let off = (y * img.width + x) * 4;
    setPixel(off, img, color);
}

function setPixel(off, img, color){
    img.data[off] = color.r;
    img.data[off+1] = color.g;
    img.data[off+2] = color.b;
    img.data[off+3] = color.a;
}

const GRAYS = Array(256);
for(let i=0; i<256; i++){
    GRAYS[i] = {r:i,g:i,b:i,a:255};
}

const BLACK = GRAYS[0];
const WHITE = GRAYS[255];

function bwColor(n, max){
    if(n < max){
        return WHITE;
    }else{
        return BLACK;
    }
}

function grayscaleColor(n, max){
    const gray = Math.floor((1.0 - (n/max)) * 255);
    return GRAYS[gray];
}

/**
* Converts an HSV color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSV_color_space.
* Assumes h, s, and v are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
* Credits to Github mjackson : https://gist.github.com/mjackson
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  v       The value
* @return  any             The RGB representation
*/
function hsvToRgb(h, s, v) {
    if(h === 1.0){
        return BLACK;
    }
    var r, g, b;
    
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    return {r:r * 255, g:g * 255, b:b * 255, a:255};
}

function getColorFunction(COLORS){
    if(COLORS.type === 'HSV'){
        const saturation = typeof COLORS.saturation === 'number'
            && COLORS.saturation <= 1.0
            && COLORS.saturation >= 0.0
            ? COLORS.saturation
            : 0.5;
        const value = typeof COLORS.value === 'number'
            && COLORS.value <= 1.0
            && COLORS.value >= 0.0
            ? COLORS.value
            : 0.5;
        return (n,max) => hsvToRgb(n/max,saturation,value);
    }else if(COLORS.type === 'GRAYSCALE'){
        return grayscaleColor;
    }else{
        return bwColor;
    }
}

function logPerformance(){
    ['draw'/*,'mandelbrot','pixel'*/].forEach(name => {
        let entries = performance.getEntriesByName(name);
        let millis = 0;
        for(const entry of entries){
            millis += entry.duration;
        }
        console.log(`${name} : ${millis / 1000}s`);
    });
    performance.clearMarks();
    performance.clearMeasures();
}

function drawMandelbrot(WIDTH,HEIGHT,ZOOM_FACTOR,ITERATIONS,ESCAPE,OFFSET,COLORS,canvas){
    performance.mark('draw-begin');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    let ctx = canvas.getContext("2d");
    let colorFct = getColorFunction(COLORS);
    let img = ctx.createImageData(WIDTH,HEIGHT);
    let nPixels = WIDTH*HEIGHT;
    for(let i=0; i < nPixels; i++) {
        let x = i%WIDTH;
        let y = Math.floor(i/WIDTH);
        //performance.mark('mandelbrot-begin');
        let iteration = isInMandelbrotSet(scaledPixelCoordinates(x,y,ZOOM_FACTOR,OFFSET),ITERATIONS,ESCAPE);
        //performance.mark('mandelbrot-end');
        //performance.measure('mandelbrot', 'mandelbrot-begin', 'mandelbrot-end');

        //performance.mark('pixel-begin');
        setPixel(i*4,img,colorFct(iteration,ITERATIONS));
        //performance.mark('pixel-end');
        //performance.measure('pixel', 'pixel-begin', 'pixel-end');
    }
    ctx.putImageData(img,0,0);
    performance.mark('draw-end');
    performance.measure('draw', 'draw-begin', 'draw-end');
    logPerformance();
}