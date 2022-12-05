'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
var gBallIntervalId
var ballsEaten
var ballsLeft
var isPassage = false
var gNearBallscount
var gGlueIntervalId
var gStuckId
var gIsStuck = false

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/GLUE.jpg">'

// Model:
var gBoard
var gGamerPos

function onInitGame() {
    ballsEaten = 0
    ballsLeft = 2
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'

    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gBallIntervalId = setInterval(ballCreator, 3000)
    gGlueIntervalId = setInterval(glueCreator, 5000)

}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
                if (i === 0 && j === 5) board[i][j].type = FLOOR
                if (i === 9 && j === 5) board[i][j].type = FLOOR
                if (i === 5 && j === 0) board[i][j].type = FLOOR
                if (i === 5 && j === 11) board[i][j].type = FLOOR
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {

    var gNearBallscount = countBalls(i, j, gBoard)
    var elBalls = document.querySelector('.balls')
    elBalls.innerText = `You have ${gNearBallscount} balls around you!`

    isPassage = isPassageMove(i, j)
    if (isPassage) {
        passagechangedirection(i, j)
        return
    }

    const targetCell = gBoard[i][j]
    // if (targetCell ===)
    if (!gIsStuck) {

        if (targetCell.type === WALL) return

        // Calculate distance to make sure we are moving to a neighbor cell
        const iAbsDiff = Math.abs(i - gGamerPos.i)
        const jAbsDiff = Math.abs(j - gGamerPos.j)

        // If the clicked Cell is one of the four allowed
        if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

            if (targetCell.gameElement === BALL) {
                playSound('eated')
                ++ballsEaten
                --ballsLeft
                var elCounter = document.querySelector('.counter span')
                elCounter.innerText = ': ' + ballsLeft + ' (YOU ATE ' + ballsEaten + ' BALLS!)'
                victoryChecker(ballsLeft)
            }

            if (targetCell.gameElement === GLUE) {
                gIsStuck = true
                gStuckId = setInterval(glueStuck, 0)
                return
            }

            // DONE: Move the gamer
            // REMOVING FROM
            // update Model
            gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
            // update DOM
            renderCell(gGamerPos, '')

            // ADD TO
            // update Model
            targetCell.gameElement = GAMER
            gGamerPos = { i, j }
            // update DOM
            renderCell(gGamerPos, GAMER_IMG)

        }
    } else return

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}


function ballCreator() {
    const emptyCells = []
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 12; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.gameElement && currCell.type === FLOOR) {
                emptyCells.push({ i, j })
            }
        }
    }
    var randomEmptyCell = getRandomInt(0, emptyCells.length)
    var emptyCell = emptyCells.splice(randomEmptyCell, 1)[0]
    gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
    ++ballsLeft
    renderCell(emptyCell, BALL_IMG)
    var elCounter = document.querySelector('.counter span')
    elCounter.innerText = ': ' + ballsLeft + ' (YOU ATE ' + ballsEaten + ' BALLS!)'
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function victory() {
    playSound('victory')
    onOpenModal()
}

function playSound(answer) {
    var sound = new Audio(`sound/${answer}.mp3`)
    sound.play()
}

function onOpenModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.add('show')
    elModal.style.display = 'block'
}

function onCloseModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function victoryChecker() {
    if (ballsLeft === 0) {
        clearInterval(gBallIntervalId)
        clearInterval(gGlueIntervalId)
        victory()
    }
}


function isPassageMove(i, j) {
    if ((gGamerPos.i === 0 && gGamerPos.j === 5 && i === -1)
        || (gGamerPos.i === 9 && gGamerPos.j === 5 && i === 10)
        || (gGamerPos.i === 5 && gGamerPos.j === 0 && j === -1)
        || (gGamerPos.i === 5 && gGamerPos.j === 11 && j === 12)) return true
}

function passagechangedirection(i, j) {
    if (gGamerPos.i === 0 && gGamerPos.j === 5 && i === -1) passagesMove(9, 5)
    if (gGamerPos.i === 9 && gGamerPos.j === 5 && i === 10) passagesMove(0, 5)
    if (gGamerPos.i === 5 && gGamerPos.j === 0 && j === -1) passagesMove(5, 11)
    if (gGamerPos.i === 5 && gGamerPos.j === 11 && j === 12) passagesMove(5, 0)
    return
}

// Move the player to a specific location
function passagesMove(i, j) {
    const targetCell = gBoard[i][j]

    if (targetCell.gameElement === BALL) {
        playSound('eated')
        ++ballsEaten
        --ballsLeft
        var elCounter = document.querySelector('.counter span')
        elCounter.innerText = ': ' + ballsLeft + ' (YOU ATE ' + ballsEaten + ' BALLS!)'
        victoryChecker(ballsLeft)
    }

    // DONE: Move the gamer
    // REMOVING FROM
    // update Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    // update DOM
    renderCell(gGamerPos, '')

    // ADD TO
    // update Model
    targetCell.gameElement = GAMER
    gGamerPos = { i, j }
    // update DOM
    renderCell(gGamerPos, GAMER_IMG)
    isPassage = false

}

function countBalls(cellI, cellJ, gBoard) {
    var ballsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue

            if (gBoard[i][j].gameElement === BALL) ballsCount++
        }
    }
    return ballsCount
}

function glueCreator() {
    const emptyCells = []
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 12; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.gameElement && currCell.type !== WALL && currCell.gameElement !== GAMER) {
                emptyCells.push({ i, j })
            }
        }
    }
    var randomEmptyCell = getRandomInt(0, emptyCells.length)
    var emptyCell = emptyCells.splice(randomEmptyCell, 1)[0]
    gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
    renderCell(emptyCell, GLUE_IMG)

    setTimeout(function () {
        if (gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE) {
            gBoard[emptyCell.i][emptyCell.j].gameElement = null
            renderCell(emptyCell, '')
        }
    }, 3000)

}

function glueStuck() {
    setTimeout(function () {
        clearInterval(gStuckId)
        gIsStuck = false
    }, 3000)
}