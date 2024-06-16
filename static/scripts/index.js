const gameSection = document.getElementById("game");
const winerDialog = document.getElementById("winer-dialog");
const winerDialogText = document.getElementById("winer-dialog-text");
const initUserSelectedTiles = [[0, 0]];
let userSelectedTiles = [];
let shortestPath = [];

async function scrollToGame() {
  gameSection.scrollIntoView({ behavior: "smooth" });
  winerDialog.classList.add("hidden")
  userSelectedTiles = initUserSelectedTiles;
  await prepareGame();
  addEventClick();
}

async function prepareGame() {
  clearBoard();
  const gameData = await getGameData();
  gameSection.insertAdjacentHTML("afterbegin", gameData["game_board"]);
  shortestPath = gameData["shortest_path"];
}

function clearBoard() {  
  if (gameSection.children.length > 0) {
    gameSection.removeChild(gameSection.children[0]);
  }
}

async function getGameData() {
  const result = await fetch("http://127.0.0.1:5000/game")
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  return result;
}

function addEventClick() {
  gameSection.addEventListener("click", (event) => {
    const target = event.target.closest(".board-tile");
    if (!target) return;

    const row = parseInt(target.getAttribute("row"));
    const col = parseInt(target.getAttribute("col"));
    const type = parseInt(target.getAttribute("type"));

    if (!isValidMove(target, row, col, type)) {
      return;
    }

    userSelectedTiles.push([row, col]);
    if (type === 2 && target.tagName === "IMG") {
      target.parentElement.classList.add("ring-8");
    } else {
      target.classList.add("ring-8");
    }

    const clickSound = new Audio("static/sounds/click.mp3");
    clickSound.play();

    checkIfPlayerWonGame(type);
  });
}

function isValidMove(element, row, col, type) {

  if (isOnBoard(row, col) || isRock(type) || isStartingPoint(row, col)) {
    return false;
  }  

  if (isLastPickTile(row, col)) {
    userSelectedTiles.pop();
    if (type === 2 && element.tagName === "IMG") {
      element.parentElement.classList.remove("ring-8");
    } else {
      element.classList.remove("ring-8");
    }
    return false;
  }

  const lastPickTile = userSelectedTiles[userSelectedTiles.length - 1];
  const lastRow = lastPickTile[0];
  const lastCol = lastPickTile[1];
  const validsMoves = [
    [lastRow - 1, lastCol],
    [lastRow + 1, lastCol],
    [lastRow, lastCol - 1],
    [lastRow, lastCol + 1],
  ];
  return compareArrays(validsMoves, [row, col]);
}

function isStartingPoint(row, col) {
  return row === 0 && col === 0;
}

function isLastPickTile(row, col) {
  return compareArrays(userSelectedTiles[userSelectedTiles.length - 1], [
    row,
    col,
  ]);
}

function isRock(type) {
  return type === 3;
}

function isOnBoard(row, col) {
  return row < 0 || col < 0 || row > 7 || col > 7;
}

function compareArrays(first, second) {
  return JSON.stringify(first).indexOf(JSON.stringify(second)) != -1;
}

function checkIfPlayerFoundSurvivors(type) {
  return type == 2;
}

function checkIfPlayerHadShortestPath() {
  return compareArrays(shortestPath, userSelectedTiles);  
}

function checkIfPlayerWonGame(type) {
  const winSound = new Audio("static/sounds/win.mp3");
  const loseSound = new Audio("static/sounds/lose.mp3");

  if (checkIfPlayerFoundSurvivors(type)) {
    if (checkIfPlayerHadShortestPath()) {
      winerDialogText.innerText = "Znalazłeś rozbitków wykorzystując najkrótszą drogę! 😁";
      winSound.play();
    }else {
      winerDialogText.innerText = "Znalazłeś rozbitków ale twoja droga nie była najkrótszą 🥲";
      loseSound.play();
    }
    winerDialog.classList.remove("hidden");
  }  
}
