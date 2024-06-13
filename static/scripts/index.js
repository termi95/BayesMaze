const gameSection = document.getElementById("game");
const winerDialog = document.getElementById("winer-dialog");
const winerDialogText = document.getElementById("winer-dialog-text");
const initUserSelectedTiles = [[0, 0]];
let userSelectedTiles = [];
let shortestPath = [];

async function scrollToGame() {
  gameSection.scrollIntoView({ behavior: "smooth" });
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
  const tiles = document.getElementsByClassName("board-tile");
  for (let index = 0; index < tiles.length; index++) {
    tiles[index].addEventListener("click", (x) => {
      const row = parseInt(x.target.getAttribute("row"));
      const col = parseInt(x.target.getAttribute("col"));
      const type = parseInt(x.target.getAttribute("type"));

      if (!isValidMove(x.target, row, col, type)) {
        return;
      }

      userSelectedTiles.push([row, col]);
      if (type === 2 && x.target.tagName === "IMG") {
        x.target.parentElement.classList.add("picked");
      } else {
        x.target.classList.add("picked");
      }
      CheckIfPlayerWonGame(type);
    });
  }
}

function isValidMove(element, row, col, type) {
  if (isOnBoard(row, col) || isRock(type) || isStartingPoint(row, col)) {
    return false;
  }

  if (isLastPickTile(row, col)) {
    userSelectedTiles.pop();
    if (type === 2 && element.tagName === "IMG") {
      element.parentElement.classList.remove("picked");
    } else {
      element.classList.remove("picked");
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

function CheckIfPlayerWonGame(type) {
  if (checkIfPlayerFoundSurvivors(type)) {
    if (checkIfPlayerHadShortestPath()) {
      winerDialogText.innerText = "Znalazłeś rozbitków wykorzystując najkrótszą drogę :).";
    }else {
      winerDialogText.innerText = "Znalazłeś rozbitków ale twoja droga nie była najkrótszą :(.";
    }
    winerDialog.showModal();
  }  
}

function backToGameStarter() {
  const gameStarter = document.getElementById("game-starter");  
  clearBoard();
  gameStarter.scrollIntoView({ behavior: "smooth" });
}