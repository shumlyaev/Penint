let canv = document.querySelector('#mainCanvas');
let ctx = canv.getContext('2d');
let mousePressed = false;
let coords = [];
let paintedBibs = [];
let paintedLines = [];

canv.width = canv.parentNode.offsetWidth;
canv.height = 850;
ctx.lineWidth = 2;

canv.onmousedown = function(e) {
    mousePressed = true;
    coords = [];
    ctx.beginPath();
}
canv.onmouseup = function(e) {
    mousePressed = false;
    paintedLines = [];
    if (coords.length > 0) {
        changeCoords(coords);
        drawBibu(coords);
        ctx.beginPath();
    }
}
canv.onmousemove = function(e) {
    if (mousePressed) {
        let curCoords = {x: e.offsetX, y: e.offsetY};
        draw(curCoords);
        coords.push(curCoords);
        paintedLines.push(curCoords);
    }
}
//уменьшает частоту точек и модифицирует массив для правильной отрисовки
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
    while (arr.length < 40 && countDistance(coords) > 300) {
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
    
    //высчитываются координаты бибы bibaOffset (центр первой окружности)
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

    //массив chCoords заполняется новыми координатами 
    let curAngle = 0;
    let angleStep = (180 / (chCoords.length / 3 - 1)) * Math.PI / 180; //в радианах
    let radius = countDistance(coords) / 13;
    if (radius < 3) radius = 3;
    if (radius > 150) radius = 150;
    bibaOffsetX += radius;//bibaOffset все еще центр первой окружности
    bibaOffsetY += radius * 1.5//bibaOffset все еще центр первой окружности
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

    //координаты пересчитываются с поворотом на rotateAngle
    bibaOffsetX -= radius;
    bibaOffsetY -= radius * 1.5;//теперь это координаты центра бибы
    let centerHyp;
    let centerXPos;
    let centerYPos;
    let rotateAngle = Math.floor(Math.random() * 361);
    let gamma;
    let beta;
    let phi;
    let piece1;
    for (let key in chCoords) {
        centerXPos = Math.abs(bibaOffsetX - chCoords[key].x);
        centerYPos = Math.abs(bibaOffsetY - chCoords[key].y);
        centerHyp = Math.sqrt(centerXPos * centerXPos + centerYPos * centerYPos);
        gamma = (180 - rotateAngle) / 2;
        piece1 = centerHyp * Math.sin(rotateAngle * Math.PI / 180) / Math.sin(gamma * Math.PI / 180);
        if (chCoords[key].x > bibaOffsetX && chCoords[key].y > bibaOffsetY) {
            beta = Math.asin(centerYPos / centerHyp) * 180 / Math.PI;
            phi = (180 - gamma - beta) * Math.PI / 180;
            chCoords[key].x += piece1 * Math.cos(phi);
            chCoords[key].y -= piece1 * Math.sin(phi);
        } else if (chCoords[key].x >= bibaOffsetX && chCoords[key].y < bibaOffsetY) {
            beta = Math.asin(centerXPos / centerHyp) * 180 / Math.PI;
            phi = (180 - gamma - beta) * Math.PI / 180;
            chCoords[key].x -= piece1 * Math.sin(phi);
            chCoords[key].y -= piece1 * Math.cos(phi);
        } else if (chCoords[key].x < bibaOffsetX && chCoords[key].y < bibaOffsetY) {
            beta = Math.asin(centerYPos / centerHyp) * 180 / Math.PI;
            phi = (180 - gamma - beta) * Math.PI / 180;
            chCoords[key].x -= piece1 * Math.cos(phi);
            chCoords[key].y += piece1 * Math.sin(phi);
        } else if (chCoords[key].x < bibaOffsetX && chCoords[key].y > bibaOffsetY) {
            beta = Math.asin(centerXPos / centerHyp) * 180 / Math.PI;
            phi = (180 - gamma - beta) * Math.PI / 180;
            chCoords[key].x += piece1 * Math.sin(phi);
            chCoords[key].y += piece1 * Math.cos(phi);
        }
    }
    
    //считается xStep и yStep для каждой точки
    let hyp;
    let hypStep;
    let angleSin;
    let angleCos;  
    for (let key in coords) {
        hyp = Math.sqrt((coords[key].x - chCoords[key].x) * (coords[key].x - chCoords[key].x) + (coords[key].y - chCoords[key].y) * (coords[key].y - chCoords[key].y));
        hypStep = hyp / 40;//40
        angleSin = Math.abs(coords[key].y - chCoords[key].y) / hyp;
        angleCos = Math.abs(coords[key].x - chCoords[key].x) / hyp;
        coords[key].xStep = hypStep * angleCos;
        coords[key].yStep = hypStep * angleSin;
    }

    //coords занимает положение chCoords
    let c = 0;
    let interval = setInterval(function() {
        if (c == 40) {//40
            clearInterval(interval);
            return;
        }
        for (let key in coords) {
            if (coords[key].x > chCoords[key].x) 
                coords[key].x -= coords[key].xStep;
            else if (coords[key].x < chCoords[key].x)
                coords[key].x += coords[key].xStep;
            if (coords[key].y > chCoords[key].y) 
                coords[key].y -= coords[key].yStep;
            else if (coords[key].y < chCoords[key].y) 
                coords[key].y += coords[key].yStep;
        }
        clear();
        drawArr(paintedLines, 0);
        drawArr(paintedBibs, 0);
        drawArr(coords, 1);
        c++;
    }, 30);//30

    //запоминается нарисованная биба
    for (let key in coords) {
        paintedBibs.push(coords[key]);
    }
    paintedBibs.push('NaN');

    ctx.beginPath();
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
function drawArr(arr, bool) {
    ctx.beginPath();
    for (let key in arr) {
        draw(arr[key]);
    }
    ctx.beginPath();
    if (bool && coords.length > 0) ctx.moveTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
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
