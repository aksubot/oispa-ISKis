const GRID_SIZE = 4
const CELL_SIZE = 14
const CELL_GAP = 2

let score = 0;
let increment;

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

let bestScore = 0;

if(getCookie("bestScore") == ""){
    console.log("null");
}
else{
    bestScore = getCookie("bestScore");
}

document.getElementById("best").innerText = bestScore;


const plus = document.querySelector(".plus")
function updateScore() {
    document.getElementById("score").innerText = score;

    plus.innerHTML = '';
    const newIncrement = document.createElement("h3");
    newIncrement.innerText = "+" + increment;
    plus.appendChild(newIncrement);
}
function updateBestScore() {
    bestScore = score;
    setCookie("bestScore", bestScore, 365);
    document.getElementById("best").innerText = bestScore;
}   

const lauseet = [
    "Oispa Itä-Suomen koulussa",
    "Oispa ISKissä",
]
const popups = document.querySelector(".popups");
function popUp() {
    popups.innerHTML = '';
    const popUpDiv = document.createElement("h1");
    popUpDiv.style.left = (Math.random() * 101) + "%";
    popUpDiv.style.top = (Math.random() * 101) + "%";
    popUpDiv.innerText = lauseet[Math.floor(Math.random()*lauseet.length)];
    popups.appendChild(popUpDiv);
}


export default class Grid{
    #cells
    constructor(gridElement){
        gridElement.style.setProperty("--grid-size", GRID_SIZE)
        gridElement.style.setProperty("--cell-size",`${CELL_SIZE}vmin`)
        gridElement.style.setProperty("--cell-gap",`${CELL_GAP}vmin`)
        this.#cells=createCellElements(gridElement).map((cellElement,index) => {
            return new Cell(
                cellElement,
                index % GRID_SIZE,
                Math.floor(index / GRID_SIZE)
            )
        })

    }
    get cells(){
        return this.#cells
    }

    get cellsByColumn(){
        return this.#cells.reduce((cellGrid,cell) => {
            cellGrid[cell.x] = cellGrid[cell.x] || []
            cellGrid[cell.x][cell.y] = cell
            return cellGrid
        },[])
    }
    get cellsByRow(){
        return this.#cells.reduce((cellGrid,cell) => {
            cellGrid[cell.y] = cellGrid[cell.y] || []
            cellGrid[cell.y][cell.x] = cell
            return cellGrid
        },[])
    }
    get #emptyCells(){
        return this.#cells.filter(cell=>cell.tile==null)
    }
    randomEmptyCell(){
        const randomIndex=Math.floor(Math.random() * this.#emptyCells.length)
        return this.#emptyCells[randomIndex]

    }
}

class Cell{
    #cellElement
    #x
    #y
    #tile
    #mergeTile
    constructor(cellElement,x,y){
        this.#cellElement=cellElement
        this.#x=x
        this.#y=y
    }

    get x(){
        return this.#x
    }

    get y(){
        return this.#y
    }
    get tile(){
        return this.#tile
    }
    set tile(value){
        this.#tile=value
        if(value==null) return
        this.#tile.x=this.#x
        this.#tile.y=this.#y
    }
    get mergeTile(){
        return this.#mergeTile
    }
    set mergeTile(value){
        this.#mergeTile=value
        if(value==null) return
        this.#mergeTile.x=this.#x
        this.#mergeTile.y=this.#y
    }

    canAccept(tile){
        return(
            this.tile == null ||
            (this.mergeTile==null && this.tile.value==tile.value)
        )
    }
    mergeTiles(){
        if(this.tile == null || this.mergeTile == null) return
        this.tile.value = this.tile.value + this.mergeTile.value
        this.mergeTile.remove()

        score += this.tile.value;
        increment = this.tile.value;

        updateScore();
        if(score > bestScore){
            updateBestScore();
        }

        popUp();

        this.mergeTile = null;

    }
}
function createCellElements(gridElement){
    const cells=[]
    for(let i = 0; i < GRID_SIZE * GRID_SIZE; i++){
        const cell=document.createElement("div")
        cell.classList.add("cell")
        cells.push(cell)
        gridElement.append(cell)
    }
    return cells
    
}
