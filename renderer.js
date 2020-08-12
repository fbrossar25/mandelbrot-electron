const remote = require('electron').remote;
const mainWindow = remote.getGlobal('mainWindow');
const Mousetrap = require('mousetrap');
const COLORS_TYPES = ['BW', 'GRAYSCALE', 'HSV', 'HSL'];

const defaultConfig = { //0.42s whit single loop
    canvas: getEID("mainCanvas"),
    HEIGHT: 800,
    WIDTH: 800,
    ESCAPE: 4, //For divergency check
    ITERATIONS: 5,
    ZOOM_FACTOR: 1,
    OFFSET: {x:0,y:0},
    COLORS: {
        type: 'GRAYSCALE',
        saturation: 0.5,
        value: 0.5 //Value for HSV, Lightness for HSL
    },
    DRAW_CENTER: false,
    LIVE_DRAW: true
};

let configInit = false;

const currentConfig = {};

function drawCenter(){
    const ctx = currentConfig.canvas.getContext("2d");
    const width = currentConfig.canvas.width;
    const height = currentConfig.canvas.height;
    const length = Math.floor(Math.min(width, height) / 20);
    const x = width / 2;
    const y = height / 2;
    ctx.strokeStyle = "#FF0000";
    ctx.moveTo(x,y-length);
    ctx.lineTo(x,y+length);
    ctx.stroke();
    ctx.moveTo(x-length, y);
    ctx.lineTo(x+length, y);
    ctx.stroke();
}

function draw(fromDrawButton=false){
    refreshControls();
    if(currentConfig.LIVE_DRAW || fromDrawButton){
        drawMandelbrot(
            currentConfig.WIDTH,
            currentConfig.HEIGHT,
            currentConfig.ZOOM_FACTOR,
            currentConfig.ITERATIONS,
            currentConfig.ESCAPE,
            currentConfig.OFFSET,
            currentConfig.COLORS,
            currentConfig.canvas
        );
    }
    if(currentConfig.DRAW_CENTER){
        drawCenter();
    }
}

function reset(){
    let saveColors = currentConfig.COLORS;
    let saveLiveDraw = currentConfig.LIVE_DRAW;
    Object.assign(currentConfig, defaultConfig)
    //Doing this to prevent change of defaultConfig.OFFSET
    currentConfig.OFFSET = Object.assign({}, defaultConfig.OFFSET);
    if(!configInit){
        currentConfig.COLORS = Object.assign({}, defaultConfig.COLORS);
        configInit = true;
    }else{
        //Prevent reset here
        currentConfig.COLORS = saveColors;
        currentConfig.LIVE_DRAW = saveLiveDraw;
    }
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
    currentConfig.ZOOM_FACTOR += 0.01;
    draw();
}

function zoomOut(){
    currentConfig.ZOOM_FACTOR -= 0.01;
    if(currentConfig.ZOOM_FACTOR < 1){
        currentConfig.ZOOM_FACTOR = 1;
    }
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
    currentConfig.ITERATIONS += 1;
    draw();
}

function lessIterations(){
    currentConfig.ITERATIONS -= 1;
    if(currentConfig.ITERATIONS < 1){
        currentConfig.ITERATIONS = 1;
    }
    draw();
}

function refreshControls(){
    getEID("inputZoom").value = currentConfig.ZOOM_FACTOR;
    getEID("inputIterations").value = currentConfig.ITERATIONS;
    getEID("inputX").value = currentConfig.OFFSET.x;
    getEID("inputY").value = currentConfig.OFFSET.y;
    getEID("inputEscape").value = currentConfig.ESCAPE;
    getEID("selectColor").value = currentConfig.COLORS.type;
    getEID("checkLive").value = currentConfig.LIVE_DRAW;
}

getEID("btClose").addEventListener("click", () =>{
    closeNav();
});

getEID("btOpen").addEventListener("click", () =>{
    openNav();
});

getEID("btDraw").addEventListener("click", () => {
    draw(true);
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

getEID("selectColor").addEventListener("change", (evt) => {
    if(COLORS_TYPES.includes(evt.target.value)){
        currentConfig.COLORS.type = evt.target.value;
    }else {
        //Prevent unwanted values
        currentConfig.COLORS.type = COLORS_TYPES[0];
    }
    draw();
});

getEID("checkLive").addEventListener("change", (evt) => {
    if(evt.target.checked){
        currentConfig.LIVE_DRAW = true;
    }else{
        currentConfig.LIVE_DRAW = false;
    }
});

getEID("checkCenter").addEventListener("change", (evt) => {
    if(evt.target.checked){
        currentConfig.DRAW_CENTER = true;
    }else{
        currentConfig.DRAW_CENTER = false;
    }
    draw();
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

Mousetrap.bind( ['left','q','a'], moveLeft);