//Scale pixel coordinates in [0,1] interval
function scaledPixelCoordinates(x,y,w,h){
    return {
        x: x / w,
        y: y / h
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
    for(var i = 0; i < ITERATIONS; i++) {
        Z = addComplex(mulComplex(Zprevious, Zprevious),C);
        Zprevious = {x: Z.x, y:Z.y};
        if (Z.x*Z.y >= ESCAPE){
            return false;
        }
    }
    return true;
}

function drawMandelbrot(WIDTH,HEIGHT,ITERATIONS,ESCAPE,canvas){
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    for(let x=0; x < WIDTH; x++) {
        for(let y=0; y < HEIGHT; y++) {
            if(isInMandelbrotSet(scaledPixelCoordinates(x,y,WIDTH,HEIGHT),ITERATIONS,ESCAPE)) {
                ctx.fillRect(x,y,1,1);
            }
        } 
    }
}

function resetCanvas(canvas){
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

window.onload = () => {
    const canvas = document.getElementById("mainCanvas");
    const HEIGHT = 600;
    const WIDTH = 600;
    const ESCAPE = 5; //For divergency check
    const ITERATIONS = 100;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    resetCanvas(canvas);
    drawMandelbrot(WIDTH,HEIGHT,ITERATIONS,ESCAPE,canvas);
};