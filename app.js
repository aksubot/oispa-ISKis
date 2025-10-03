
// const xObject = document.querySelector(".x");

// document.body.onkeyup = function(e) {
//     e.preventDefault()
//   if (
//       e.code == "Escape" ||      
//       e.keyCode == 27   
//   ) {
//     document.getElementById("wilma").classList.toggle("block");
//     xObject.classList.toggle("block");
//     console.log(document.title);
//     if(document.title == "Oispa Itä-Suomen koulussa")  
//         document.title = "Wilmaan kirjautuminen - Wilma - Itä-Suomen koulu"
//     else
//         document.title = "Oispa Itä-Suomen koulussa"
//   }


// }

// xObject.onclick = function(e) {
//       e.code == "Escape" ||      
//       e.keyCode == 27   
//     document.getElementById("wilma").classList.toggle("block");
//     xObject.classList.toggle("block");
//     console.log(document.title);
//     if(document.title == "Oispa Itä-Suomen koulussa")  
//         document.title = "Wilmaan kirjautuminen - Wilma - Itä-Suomen koulu"
//     else
//         document.title = "Oispa Itä-Suomen koulussa"
// }

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery

}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
async function handleTouchMove(evt) {

    // evt.preventDefault()

    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = (xDown - xUp) * -1;
    var yDiff = (yDown - yUp) * -1;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
        } else {
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
        }                       
    } else {
        if ( yDiff > 0 ) {
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown() 
        } else { 
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()          
        }                                                       
    }
    /* reset values */
    xDown = null;
    yDown = null;      
    
    grid.cells.forEach(cell => cell.mergeTiles())
    const newTile = new Tile(boardgame)
    grid.randomEmptyCell().tile = newTile
    if (!canMoveDown() && !canMoveUp() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            alert("You Lose")
        })
        return
    }


    setupInput()
};


document.querySelector(".btn").onclick = function(){

    grid.cells.forEach(
        cell => cell.destroyTiles()
    )

    grid.lintsaa()

}


import Grid from "./grid.js"
import Tile from "./tile.js"

const boardgame = document.querySelector('.board-game')
const grid = new Grid(boardgame)
grid.randomEmptyCell().tile = new Tile(boardgame)
grid.randomEmptyCell().tile = new Tile(boardgame)
setupInput()
function setupInput() {
    window.addEventListener("keydown", handleInput, { once: true })
}
async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()
            break
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
            break
        default:
            setupInput()
            return

    }
    grid.cells.forEach(cell => cell.mergeTiles())
    const newTile = new Tile(boardgame)
    grid.randomEmptyCell().tile = newTile
    if (!canMoveDown() && !canMoveUp() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            document.querySelector(".gameOver").classList.remove("false");
        })
        return
    }


    setupInput()
}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}
function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}
function moveLeft() {
    return slideTiles(grid.cellsByRow)
}
function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = []
            for (let i = 1; i < group.length; i++) {
                const cell = group[i]
                if (cell.tile == null) continue
                let lastValidCell
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j]
                    if (!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell

                }
                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition())
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile
                    } else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}
function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}
function canMoveLeft() {
    return canMove(grid.cellsByRow)
}
function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}



function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)

        })
    })
}