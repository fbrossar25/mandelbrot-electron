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
    let x2, y2;
    for(let i = 0; i < ITERATIONS; i++) {
        x2 = Zprevious.x * Zprevious.x;
        y2 = Zprevious.y * Zprevious.y;
        Z = {
            x: x2 - y2 + C.x,
            y: 2 * Zprevious.x * Zprevious.y + C.y
        };
        if(x2 + y2 > ESCAPE){
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
    let r, g, b;
    
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    
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


function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

/**
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
* Credits to Github mjackson : https://gist.github.com/mjackson
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  l       The lightness
* @return  Array           The RGB representation
*/
function hslToRgb(h, s, l) {
    if(h === 1.0){
        return BLACK;
    }
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {r:r * 255, g:g * 255, b:b * 255, a:255};
}

function getColorFunction(COLORS){
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
    if(COLORS.type === 'HSV'){
        return (n,max) => hsvToRgb(n/max,saturation,value);
    }else if(COLORS.type === 'HSL'){
        return (n,max) => hslToRgb(n/max,saturation,value);
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