var t=0;                // time in ms
// var fps = 100;          // frames per second
var fps = 20;           // frames per second
var timeInterval = 1000 / fps;   // in ms
var canvas = null;      // canvas DOM object
var context = null;     // canvas context

var amplitude = 150;
var centerX = 0;
var centerY = 0;
var period = 4000;      // in ms

var numRectangles = 9;
var myRectangles = new Array(numRectangles);
var padding = 2;
var colorWheel = new Array();

var routeLength = 200;
var myRoutes = new Array(numRectangles);

var numWallRows;
var numWallCols;
var walls = new Array();
var wallSize = 10;

var mouseDown = null;
var mouseMove = null;
var mouseUp = null;
var isDragging = false;

function Point(x,y) {
    this.x=x;
    this.y=y;
}

function Rectangle(x, y, width, height, borderWidth, fillStyle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.borderWidth = borderWidth;
    this.fillStyle = fillStyle;
}

function init() {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    initStageObjects();
    drawStageObjects1();
    //setInterval(updateStage, timeInterval);
    setTimeout(updateStage, timeInterval);
}

function updateStage() {
    t += timeInterval;
    clearCanvas1();
    updateStageObjects1();
    drawStageObjects1();
    setTimeout(updateStage, timeInterval);
}

function initStageObjects() {
    var width, height, color, i, req, lines;

    colorWheel.push("#8ED6FF");
    colorWheel.push("#D6FF8E");
    colorWheel.push("#FF8ED6");
    centerX = canvas.width/2;
    centerY = canvas.height/2;
    width = 9;
    height = 9;

    for (i=0; i<numRectangles; i++) {
        color = colorWheel.shift(color);
        colorWheel.push(color);
        myRectangles[i] = new Rectangle (centerX-(width/2),centerY-(height/2),width,height,padding,color);
        myRoutes[i] = new Array(routeLength);
        for (j=0; j<routeLength; j++) {
            myRoutes[i][j] = new Point(centerX,centerY);
        }
    }

    req = new XMLHttpRequest();
    req.open('GET', 'maze1.txt', false);
    req.send(null);
    if (req.status == 200) {
        //dump(req.responseText);
        lines = req.responseText.split("\n");
        numWallRows = lines.length;
        numWallCols = lines[0].length;
        for (i=0; i<numWallRows; i++) {
            walls[i] = lines[i].split("");
            if (walls[i].length != numWallRows) {
                context.clearRect(0,0,400,60);
                context.font = "18pt Minion";
                context.fillStyle = "dimgray";
                context.textAlign = "center";
                context.fillText(i + ": " + walls[i].length + ", " + lines[i], 200, 40);
            }
        }
    }
}

function drawStageObjects1() {

    for (i=0; i<numWallRows; i++) {
        for (j=0; j<numWallCols; j++) {
            if (walls[i][j] == 1) {
                context.beginPath();
	        context.rect(j*wallSize, i*wallSize, wallSize, wallSize);
                context.fillStyle="darkblue";
	        context.fill();
            }
        }
    }

    for (i=0; i<numRectangles; i++) {
        context.beginPath();
        context.moveTo(myRoutes[i][0].x,myRoutes[i][0].y);
        for (j=1; j<myRoutes[i].length; j++) {
            context.lineTo(myRoutes[i][j].x,myRoutes[i][j].y);
        }
        context.lineWidth=1;
        context.lineJoin="miter";
        context.strokeStyle="#8ED6FF";
        context.stroke();
    }

    for (i=0; i<numRectangles; i++) {
        context.beginPath();
        context.rect(myRectangles[i].x,myRectangles[i].y,
      	             myRectangles[i].width,myRectangles[i].height);

        context.fillStyle=myRectangles[i].fillStyle;
        context.fill();
        context.lineWidth=myRectangles[i].borderWidth;
        context.strokeStyle="darkblue";
        context.stroke();
    }

}

function drawStageObjects2() {
    context.beginPath();
    context.rect(myRectangle.x, myRectangle.y,
	         myRectangle.width, myRectangle.height);
    context.fillStyle="#8ED6FF";
    context.fill();
    context.lineWidth=myRectangle.borderWidth;
    context.strokeStyle="darkblue";
    context.stroke();
}

function updateStageObjects1() {
    if (mouseDown != null) {
        handleMouseDown(mouseDown);
        mouseDown = null;
    }
    if (mouseMove != null) {
        handleMouseMove(mouseMove);
        mouseMove = null;
    }
    if (mouseUp != null) {
        handleMouseUp(mouseUp);
        mouseUp = null;
    }

    // Move rectangle randomly +-1 unit in the x and/or y directions
    for (i=0; i<numRectangles; i++) {
        var direction = Math.floor(Math.random()*4);
        var nextX = 0;
        var nextY = 0;
        var scale = 5;
        switch(direction)
        {
            case 0:
            if (blockIsClear(myRectangles[i].x + myRectangles[i].width + scale, myRectangles[i].y) &&
                blockIsClear(myRectangles[i].x + myRectangles[i].width + scale, myRectangles[i].y + myRectangles[i].height) &&
                myRectangles[i].x + scale < canvas.width - myRectangles[i].width) {
                nextX = scale;
            }
            break;
            case 1:
            if (blockIsClear(myRectangles[i].x, myRectangles[i].y + myRectangles[i].height + scale) &&
                blockIsClear(myRectangles[i].x + myRectangles[i].width, myRectangles[i].y + myRectangles[i].height + scale) &&
	        myRectangles[i].y + scale < canvas.height - myRectangles[i].height) {
                nextY = scale;
            }
            break;
            case 2:
            if (blockIsClear(myRectangles[i].x - scale, myRectangles[i].y) &&
                blockIsClear(myRectangles[i].x - scale, myRectangles[i].y + myRectangles[i].height) &&
	        myRectangles[i].x - scale > 0) {
                nextX = -scale;
            }
            break;
            case 3:
            if (blockIsClear(myRectangles[i].x, myRectangles[i].y - scale) &&
                blockIsClear(myRectangles[i].x + myRectangles[i].width, myRectangles[i].y - scale) &&
	        myRectangles[i].y - scale > 0) {
                nextY = -scale;
            }
            break;
        }
        nextX += myRectangles[i].x;
        nextY += myRectangles[i].y;
        myRectangles[i].x = nextX;
        myRectangles[i].y = nextY;
        myRoutes[i].shift()
        myRoutes[i].push(new Point(nextX + myRectangles[i].width/2,
                                   nextY + myRectangles[i].height/2));
    }
}

function updateStageObjects2() {
    // Move rectangle randomly +-1 unit in the x and/or y directions
    var nextX = (Math.floor(Math.random()*3) - 1)*5 + myRectangle.x;
    var nextY = (Math.floor(Math.random()*3) - 1)*5 + myRectangle.y;
    myRectangle.x = nextX;
    myRectangle.y = nextY;
    myRoute.push(new Point(nextX + myRectangle.width/2,
                           nextY + myRectangle.height/2));
}

function updateStageObjects3() {
    // Move rectangle randomly +-1 unit in the x and/or y directions
    var nextX = Math.floor(Math.random()*3) - 1 + myRectangle.x;
    var nextY = Math.floor(Math.random()*3) - 1 + myRectangle.y;
    myRectangle.x = nextX;
    myRectangle.y = nextY;
}

function blockIsClear(x,y) {

    var col = Math.floor(x / wallSize);
    var row = Math.floor(y / wallSize);
    if (walls[row][col] == 0) {
        return true;
    }
    return false;
}

function clearCanvas1() {
    context.clearRect(0,0,canvas.width, canvas.height);
}

function clearCanvas2() {
    context.clearRect(myRectangle.x-padding, myPaddedRectangle.y-padding,
	              myPaddedRectangle.width+(padding*2), myPaddedRectangle.height+(padding*2));
    //context.clearRect(myPaddedRectangle.x, myPaddedRectangle.y,
    //        myPaddedRectangle.width, myPaddedRectangle.height);
    //context.clearRect(0,0,canvas.width, canvas.height);
}


function registerMouseMove(event) {
    mouseMove = event;
}


function registerMouseDown(event) {
    mouseDown = event;
}


function registerMouseUp(event) {
    mouseUp = event;
}


function handleMouseMove(event) {
    if (isDragging) {
        var mouseX = event.clientX - canvas.offsetLeft;
        var mouseY = event.clientY - canvas.offsetTop;

        setWall(mouseX,mouseY);
    }
}


function handleMouseDown(event) {
    var mouseX, mouseY;

    mouseX = event.clientX - canvas.offsetLeft;
    mouseY = event.clientY - canvas.offsetTop;

    isDragging=true;

    setWall(mouseX,mouseY);
}


function handleMouseUp(event) {
    isDragging=false;
}


function setWall(x,y) {
    var row, col;

    row = Math.floor(y / wallSize);
    col = Math.floor(x / wallSize);

    if (row >= 0 && row < numWallRows && col > 0 && col < numWallCols) {
        walls[row][col] = 1;
    }
}
