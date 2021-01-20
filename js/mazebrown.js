let t = 0                // time in ms
// let fps = 100          // frames per second
let fps = 20           // frames per second
let timeInterval = 1000 / fps   // in ms
let canvas = null      // canvas DOM object
let context = null     // canvas context

let amplitude = 150
let centerX = 0
let centerY = 0
let period = 4000      // in ms

let numRectangles = 9
let myRectangles = new Array(numRectangles)
let padding = 2
let colorWheel = new Array()

let routeLength = 200
let myRoutes = new Array(numRectangles)

let numWallRows
let numWallCols
let walls = new Array()
let wallSize = 10

let mouseDown = null
let mouseMove = null
let mouseUp = null
let isDragging = false
let mouseButton = 1


let Point = class {

    x = 0
    y = 0

    /**
     * Initialize the class.
     * @param x {number} - x coordinate
     * @param y {number} - y coordinate
     */
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}


let Rectangle = class {

    x = 0
    y = 0
    width = 0
    height = 0
    borderWidth = 0
    fillStyle = "#FFFFFF"
    direction = 0
    momentum = 0

    /**
     * Initialize the class.
     * @param x {number} - x coordinate
     * @param y {number} - y coordinate
     * @param width {number} - width
     * @param height {number} - height
     * @param borderWidth {number} - width of border
     * @param fillStyle {string} - hex RGB color
     */
    constructor(x, y, width, height, borderWidth, fillStyle, momentum) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.borderWidth = borderWidth
        this.fillStyle = fillStyle
        this.direction = Math.floor(Math.random()*4)
        this.momentum = momentum
    }
}


function init() {
    canvas = document.getElementById("myCanvas")
    context = canvas.getContext("2d")
    initStageObjects()
    drawStageObjects()
    setTimeout(updateStage, timeInterval)
}


function updateStage() {
    t += timeInterval
    clearCanvas()
    updateStageObjects()
    drawStageObjects()
    setTimeout(updateStage, timeInterval)
}


function initStageObjects() {
    let width, height, color, i, req, lines

    colorWheel.push("#8ED6FF")
    colorWheel.push("#D6FF8E")
    colorWheel.push("#FF8ED6")
    centerX = canvas.width/2
    centerY = canvas.height/2
    width = 9
    height = 9
    momentum = 0.8

    for (i=0; i<numRectangles; i++) {
        color = colorWheel.shift(color)
        colorWheel.push(color)
        myRectangles[i] = new Rectangle(
            centerX-(width/2),
            centerY-(height/2),
            width,
            height,
            padding,
            color,
            momentum
        )
        myRoutes[i] = new Array(routeLength)
        for (j=0; j<routeLength; j++) {
            myRoutes[i][j] = new Point(centerX,centerY)
        }
    }

    req = new XMLHttpRequest()
    req.open('GET', 'maze1.txt', false)
    req.send(null)
    if (req.status === 200) {
        // dump(req.responseText)
        lines = req.responseText.split("\n")
        numWallRows = lines.length
        numWallCols = lines[0].length
        for (i=0; i<numWallRows; i++) {
            walls[i] = lines[i].split("").map(x => parseInt(x, 10))
            if (walls[i].length != numWallRows) {
                context.clearRect(0, 0, 400, 60)
                context.font = "18pt Minion"
                context.fillStyle = "dimgray"
                context.textAlign = "center"
                context.fillText(i + ": " + walls[i].length + ", " + lines[i], 200, 40)
            }
        }
    }
}


function drawStageObjects() {
    let i, j

    for (i=0; i<numWallRows; i++) {
        for (j=0; j<numWallCols; j++) {
            if (walls[i][j] === 1) {
                context.beginPath()
                context.rect(j*wallSize, i*wallSize, wallSize, wallSize)
                context.fillStyle = "darkblue"
                context.fill()
            } else if (walls[i][j] === 2) {
                context.beginPath()
                context.rect(j*wallSize, i*wallSize, wallSize, wallSize)
                context.fillStyle = "firebrick"
                context.fill()
                context.lineWidth = padding
                context.strokeStyle = "darkblue"
                context.stroke()
            }
        }
    }

    for (i=0; i<numRectangles; i++) {
        context.beginPath()
        context.moveTo(myRoutes[i][0].x,myRoutes[i][0].y)
        for (j=1; j<myRoutes[i].length; j++) {
            context.lineTo(myRoutes[i][j].x,myRoutes[i][j].y)
        }
        context.lineWidth = 1
        context.lineJoin = "miter"
        context.strokeStyle = "#8ED6FF"
        context.stroke()
    }

    for (i=0; i<numRectangles; i++) {
        context.beginPath()
        context.rect(myRectangles[i].x,myRectangles[i].y,
      	             myRectangles[i].width,myRectangles[i].height)

        context.fillStyle = myRectangles[i].fillStyle
        context.fill()
        context.lineWidth = myRectangles[i].borderWidth
        context.strokeStyle = "darkblue"
        context.stroke()
    }

}


function updateStageObjects() {
    let i, rectangle, direction, nextX, nextY, scale

    if (mouseDown != null) {
        handleMouseDown(mouseDown)
        mouseDown = null
    }

    if (mouseMove != null) {
        handleMouseMove(mouseMove)
        mouseMove = null
    }

    if (mouseUp != null) {
        handleMouseUp(mouseUp)
        mouseUp = null
    }

    // Move rectangle randomly +-1 unit in the x and/or y directions
    for (i=0; i<numRectangles; i++) {
        rectangle = myRectangles[i]
        if (rectangle.direction === -1 ||
            rectangle.momentum <= Math.random()) {
            rectangle.direction = Math.floor(Math.random()*4)
        }
        direction = rectangle.direction
        nextX = 0
        nextY = 0
        scale = 5
        switch(direction)
        {
            case 0:  // right
            if (blockIsClear(rectangle.x + rectangle.width + scale, rectangle.y) &&
                blockIsClear(rectangle.x + rectangle.width + scale, rectangle.y + rectangle.height) &&
                rectangle.x + scale < canvas.width - rectangle.width) {
                nextX = scale
            } else {
                rectangle.direction = -1
            }
            break
            case 1:  // down
            if (blockIsClear(rectangle.x, rectangle.y + rectangle.height + scale) &&
                blockIsClear(rectangle.x + rectangle.width, rectangle.y + rectangle.height + scale) &&
	        rectangle.y + scale < canvas.height - rectangle.height) {
                nextY = scale
            } else {
                rectangle.direction = -1
            }
            break
            case 2:  // left
            if (blockIsClear(rectangle.x - scale, rectangle.y) &&
                blockIsClear(rectangle.x - scale, rectangle.y + rectangle.height) &&
	        rectangle.x - scale > 0) {
                nextX = -scale
            } else {
                rectangle.direction = -1
            }
            break
            case 3:  // up
            if (blockIsClear(rectangle.x, rectangle.y - scale) &&
                blockIsClear(rectangle.x + rectangle.width, rectangle.y - scale) &&
	        rectangle.y - scale > 0) {
                nextY = -scale
            } else {
                rectangle.direction = -1
            }
            break
        }
        nextX += rectangle.x
        nextY += rectangle.y
        rectangle.x = nextX
        rectangle.y = nextY
        myRoutes[i].shift()
        myRoutes[i].push(new Point(nextX + rectangle.width/2,
                                   nextY + rectangle.height/2))
    }
}


function blockIsClear(x,y) {
    let col, row

    col = Math.floor(x / wallSize)
    row = Math.floor(y / wallSize)
    if (walls[row][col] === 0) {
        return true
    }
    return false
}


function clearCanvas() {
    context.clearRect(0,0,canvas.width, canvas.height)
}


function registerMouseMove(event) {
    mouseMove = event
}


function registerMouseDown(event) {
    mouseDown = event
}


function registerMouseUp(event) {
    mouseUp = event
}


function handleMouseMove(event) {
    let mouseX, mouseY

    if (isDragging) {
        mouseX = event.clientX - canvas.offsetLeft
        mouseY = event.clientY - canvas.offsetTop

        if (mouseButton === 1) {
            setWall(mouseX, mouseY)
        }
        else if (mouseButton === 3) {
            unsetWall(mouseX, mouseY)
        }
    }
}


function handleMouseDown(event) {
    let mouseX, mouseY

    if (event.which === 3 || event.metaKey) {
        mouseButton = 3
    }
    else {
        mouseButton = 1
    }

    mouseX = event.clientX - canvas.offsetLeft
    mouseY = event.clientY - canvas.offsetTop

    isDragging = true

    if (mouseButton === 1) {
        setWall(mouseX, mouseY)
    }
    else if (mouseButton === 3) {
        unsetWall(mouseX, mouseY)
    }
}


function handleMouseUp(event) {
    isDragging = false
}


function setWall(x, y) {
    let row, col

    row = Math.floor(y / wallSize)
    col = Math.floor(x / wallSize)

    if (row >= 0 &&
        row < numWallRows &&
        col > 0 &&
        col < numWallCols &&
        walls[row][col] === 0) {
        walls[row][col] = 2
    }
}


function unsetWall(x, y) {
    let row, col

    row = Math.floor(y / wallSize)
    col = Math.floor(x / wallSize)

    if (row >= 0 &&
        row < numWallRows &&
        col > 0 &&
        col < numWallCols &&
        walls[row][col] > 1) {
        walls[row][col] = 0
    }
}
