class Biba {
    constructor() {

    }
}

let canv = document.querySelector('#mainCanvas');
let ctx = canv.getContext('2d');
let mousePressed = false;
let coords = [];

canv.width = canv.parentNode.offsetWidth;
canv.height = 850;

$('#clearCanv').on('click', function(e) {
    clear();
    drawNet();
});
$('#clearCoords').on('click', function(e) {
    coords = [];
    console.log(coords);
});
$('#drawCoords').on('click', function(e) {
    console.log('Dst before ' + countDistance(coords));
    changeCoords(coords);
    console.log('Dst after ' + countDistance(coords));
    console.log(coords);
});

drawNet();
//initCoordsWith(30);

canv.onmousedown = function(e) {
    mousePressed = true;
    coords = [];

    //let biba = new Biba();
}
canv.onmouseup = function(e) {
    mousePressed = false;
    changeCoords(coords);
    //console.log(coords);
    //scale = countDistance(coords) / 13;
    drawBibu(coords);
    ctx.beginPath();
    //console.log(coords);
}
canv.onmousemove = function(e) {
    if (mousePressed) {
        let curCoords = {x: e.offsetX, y: e.offsetY, xStep: 0, yStep: 0};
        draw(curCoords);
        coords.push(curCoords);
    }
}
function changeCoords(arr) {
    let curDist = 0;
    let i = 0, j = 1;
    //последний элемент не удаляется в любом случае
    while (i < arr.length - 1) {
        while (j < arr.length - 1) {
            curDist = Math.sqrt((arr[j].x - arr[i].x) * (arr[j].x - arr[i].x) + (arr[j].y - arr[i].y) * (arr[j].y - arr[i].y));
            if (curDist < 5) {
                arr.splice(j, 1);
            } else break;
        }
        i++;
        j = i + 1;
    }   
    while (arr.length < 20) {
        arr.push({x: arr[arr.length - 1].x, y: arr[arr.length - 1].y});
    }
    while (arr.length % 3 != 0) {
        arr.push({x: arr[arr.length - 1].x, y: arr[arr.length - 1].y});
    }    
}
function drawBibu(arr) {
    let chCoords = [];
    let i = 0;
    while (i < arr.length) {
        chCoords.push({x: 0, y: 0});
        i++;
    }
    i = 0;
    let coords = [];
    while (i < arr.length) {
        coords.push({x: arr[i].x, y: arr[i].y, xStep: 0, yStep: 0});
        i++;
    }
    

    //высчитывается положение бибы bibaOffset
    let bibaOffsetX = 0;
    let bibaOffsetY = 0;
    let minX = canv.width, minY = canv.height, maxX = 0, maxY = 0;
    for (let key in coords) {
        if (coords[key].x < minX) minX = coords[key].x;
        if (coords[key].x > maxX) maxX = coords[key].x;
        if (coords[key].y < minY) minY = coords[key].y;
        if (coords[key].y > maxY) maxY = coords[key].y;
    }
    bibaOffsetX = minX + (maxX - minX) / 2;
    bibaOffsetY = minY + (maxY - minY) / 2;
    //console.log('minX ' + minX + ' maxX ' + maxX);
    //console.log('minY ' + minY + ' maxY ' + maxY);
    //console.log('offX ' + bibaOffsetX + ' offY ' + bibaOffsetY);

    //массив chCoords заполняется новыми координатами 
    let curAngle = 0;
    let angleStep = (180 / (chCoords.length / 3 - 1)) * Math.PI / 180;
    let radius = countDistance(coords) / 13;
    if (radius < 3) radius = 3;
    if (radius > 150) radius = 150;
    bibaOffsetX += radius;
    bibaOffsetY += radius * 1.5;

    for (let key in chCoords) {
        if (key < (chCoords.length / 3)) {     
            chCoords[key].x = radius * Math.sin(curAngle) + bibaOffsetX;
            chCoords[key].y = radius * Math.cos(curAngle) + bibaOffsetY;
            curAngle += angleStep;
        }
        if (key == chCoords.length / 3) {
           curAngle = 90 * Math.PI / 180;
        }
        if (key >= chCoords.length / 3 && key < chCoords.length / 3 * 2) {
            chCoords[key].x = radius * Math.sin(curAngle) - radius + bibaOffsetX;
            chCoords[key].y = radius * Math.cos(curAngle) - radius * 3 + bibaOffsetY;
            curAngle += angleStep;
        }
        if (key == chCoords.length / 3 * 2) {
            curAngle = 180 * Math.PI / 180;
        }
        if (key >= chCoords.length / 3 * 2 && key < chCoords.length) {
            chCoords[key].x = radius * Math.sin(curAngle) - radius * 2 + bibaOffsetX;
            chCoords[key].y = radius * Math.cos(curAngle) + bibaOffsetY;
            curAngle += angleStep;
        }
    }

    //считается xStep и yStep для каждой точки
    let hyp;
    let hypStep;
    let angleSin;
    let angleCos;  
    for (let key in coords) {
        hyp = Math.sqrt((coords[key].x - chCoords[key].x) * (coords[key].x - chCoords[key].x) + (coords[key].y - chCoords[key].y) * (coords[key].y - chCoords[key].y));
        hypStep = hyp / 40;
        angleSin = Math.abs(coords[key].y - chCoords[key].y) / hyp;
        angleCos = Math.abs(coords[key].x - chCoords[key].x) / hyp;
        coords[key].xStep = hypStep * angleCos;
        coords[key].yStep = hypStep * angleSin;
    }

    //coords занимает положение chCoords
    let c = 0;
    let interval = setInterval(function() {
        if (c == 40) {
            clearInterval(interval);
            return;
        }
        clear();
        drawNet();
        for (let key in coords) { 
            if (coords[key].x > chCoords[key].x) 
                coords[key].x -= coords[key].xStep;
            else 
                coords[key].x += coords[key].xStep;
            if (coords[key].y > chCoords[key].y) 
                coords[key].y -= coords[key].yStep;
            else 
                coords[key].y += coords[key].yStep;
        }
        drawArr(coords);
        c++;
    }, 30);

    console.log(arr);
    //clear();
    //drawNet();
    ctx.beginPath();
    //console.log(chCoords);
}
function countDistance(arr) {
    let dist = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        dist += Math.sqrt((arr[i + 1].x - arr[i].x) * (arr[i + 1].x - arr[i].x) + (arr[i + 1].y - arr[i].y) * (arr[i + 1].y - arr[i].y));
    }
    return dist;
}


function draw(data) {
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
}
function clear() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = 'black';
    ctx.beginPath();
}
function drawArr(arr) {
    for (let key in arr) {
        draw(arr[key]);
    }
    ctx.beginPath();
}
function initCoordsWith(x) {
    for (let i = 0; i < x; i++) {
        coords.push({x: 200, y: 0});
    }
    console.log(coords);
}
function drawNet() {
    let step = 100;
    ctx.beginPath();
    ctx.strokeStyle = 'silver';
    for (let i = 0; i < 12; i++) {
        ctx.moveTo(step, 0);
        ctx.lineTo(step, canv.height);
        ctx.stroke();
        ctx.moveTo(0, step);
        ctx.lineTo(canv.width, step);
        ctx.stroke();
        step += 100;
    }
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
}
