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

function isInMandelbrotSet(C, ITERATIONS, ESCAPE) {
    let Zprevious = {x:C.x,y:C.y};
    let Z = {x:0, y:0};
    for(let i = 0; i < ITERATIONS; i++) {
        Z = addComplex(mulComplex(Zprevious, Zprevious),C);
        if (Z.x*Z.y >= ESCAPE){
            return false;
        }
        Zprevious = {x: Z.x, y:Z.y};
    }
    return true;
}

function setPixel(x,y,img,color){
    let off = (y * img.width + x) * 4;
    img.data[off] = color.r;
    img.data[off+1] = color.g;
    img.data[off+2] = color.b;
    img.data[off+3] = color.a;
}

function drawMandelbrot(WIDTH,HEIGHT,ZOOM_FACTOR,ITERATIONS,ESCAPE,OFFSET,canvas){
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    let ctx = canvas.getContext("2d");
    let colorIn =  {r:0,g:0,b:0,a:255};
    let img = ctx.createImageData(WIDTH,HEIGHT);
    for(let x=0; x < WIDTH; x++) {
        for(let y=0; y < HEIGHT; y++) {
            if(isInMandelbrotSet(scaledPixelCoordinates(x,y,ZOOM_FACTOR,OFFSET),ITERATIONS,ESCAPE)) {
                setPixel(x,y,img,colorIn);
            }
        } 
    }
    ctx.putImageData(img,0,0);
}