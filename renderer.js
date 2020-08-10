const remote = require('electron').remote;
const mainWindow = remote.getGlobal('mainWindow');
const Mousetrap = require('mousetrap');

const defaultConfig = {
    canvas: getEID("mainCanvas"),
    HEIGHT: 500,
    WIDTH: 500,
    ESCAPE: 5, //For divergency check
    ITERATIONS: 100,
    ZOOM_FACTOR: 200,
    OFFSET: {x:1.5,y:2.0}
};

const currentConfig = {};

function draw(){
    refreshControls();
    drawMandelbrot(
        currentConfig.WIDTH,
        currentConfig.HEIGHT,
        currentConfig.ZOOM_FACTOR,
        currentConfig.ITERATIONS,
        currentConfig.ESCAPE,
        currentConfig.OFFSET,
        currentConfig.canvas
    );
}

function reset(){
    Object.assign(currentConfig, defaultConfig)
    //Doing this to prevent change of defaultConfig.OFFSET
    currentConfig.OFFSET = Object.assign({}, defaultConfig.OFFSET);
    draw();
}

function getEID(id){
    return document.getElementById(id);
}

function roundDecimals(n, decimals){
    let pow10 = Math.pow(10, Math.floor(decimals));
    return Math.round(n  * pow10) / pow10;
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    getEID("mySidenav").style.width = "250px";
    getEID("main").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    getEID("mySidenav").style.width = "0";
    getEID("main").style.marginLeft = "0";
}

function zoomIn(){
    currentConfig.ZOOM_FACTOR += 50;
    draw();
}

function zoomOut(){
    currentConfig.ZOOM_FACTOR -= 50;
    draw();
}

function moveUp(){
    currentConfig.OFFSET.y = roundDecimals(currentConfig.OFFSET.y + 0.1, 2);
    draw();
}

function moveDown(){
    currentConfig.OFFSET.y = roundDecimals(currentConfig.OFFSET.y - 0.1, 2);
    draw();
}

function moveLeft(){
    currentConfig.OFFSET.x = roundDecimals(currentConfig.OFFSET.x + 0.1, 2);
    draw();
}

function moveRight(){
    currentConfig.OFFSET.x = roundDecimals(currentConfig.OFFSET.x - 0.1, 2);
    draw();
}

function moreIterations(){
    currentConfig.ITERATIONS += 10;
    draw();
}

function lessIterations(){
    currentConfig.ITERATIONS -= 10;
    draw();
}

function refreshControls(){
    getEID("inputZoom").value = currentConfig.ZOOM_FACTOR;
    getEID("inputIterations").value = currentConfig.ITERATIONS;
    getEID("inputX").value = currentConfig.OFFSET.x;
    getEID("inputY").value = currentConfig.OFFSET.y;
    getEID("inputEscape").value = currentConfig.ESCAPE;
}

getEID("btClose").addEventListener("click", () =>{
    closeNav();
});

getEID("btOpen").addEventListener("click", () =>{
    openNav();
});

getEID("btDraw").addEventListener("click", () =>{
    openNav();
});

getEID("btDraw").addEventListener("click", () => {
    draw();
});

getEID("btReset").addEventListener("click", () => {
    reset();
});

getEID("btZoomIn").addEventListener("click", zoomIn);

getEID("btZoomOut").addEventListener("click", zoomOut);

getEID("btIterationsPlus").addEventListener("click", moreIterations);

getEID("btIterationsMinus").addEventListener("click", lessIterations);

getEID("inputZoom").addEventListener("change", (evt) => {
    if(evt.target.valueAsNumber !== 0){
        currentConfig.ZOOM_FACTOR = evt.target.valueAsNumber;
        draw();
    }else{
        evt.target.value = currentConfig.ZOOM_FACTOR;
        return false;
    }
});

getEID("inputX").addEventListener("change", (evt) => {
    if(typeof evt.target.valueAsNumber === 'number'){
        currentConfig.OFFSET.x = evt.target.valueAsNumber;
        draw();
    }
});

getEID("inputY").addEventListener("change", (evt) => {
    if(typeof evt.target.valueAsNumber === 'number'){
        currentConfig.OFFSET.y = evt.target.valueAsNumber;
        draw();
    }
});

getEID("inputIterations").addEventListener("change", (evt) => {
    if(evt.target.valueAsNumber > 0){
        currentConfig.ITERATIONS = Math.floor(evt.target.valueAsNumber);
        draw();
    }else{
        evt.target.value = currentConfig.ITERATIONS;
        return false;
    }
});

getEID("inputEscape").addEventListener("change", (evt) => {
    if(evt.target.valueAsNumber >= 1){
        currentConfig.ESCAPE = evt.target.valueAsNumber;
        draw();
    }else{
        evt.target.value = currentConfig.ESCAPE;
        return false;
    }
});

window.onload = () => {
    reset();
};

Mousetrap.bind( 'f12', () => {
    mainWindow.openDevTools();
});

Mousetrap.bind( 'space', reset);

Mousetrap.bind( ['-','f'], zoomOut);

Mousetrap.bind( ['ctrl+plus','x'], moreIterations);

Mousetrap.bind( ['ctrl+-','c'], lessIterations);

Mousetrap.bind( ['plus','r'], zoomIn);

Mousetrap.bind( ['right','d'], moveRight);

Mousetrap.bind( ['up','z','w'], moveUp);

Mousetrap.bind( ['down','s'], moveDown);

Mousetrap.bind(['left','q','a'], moveLeft);