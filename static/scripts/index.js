const gameSection = document.getElementById("game");

async function scrollToGame() {
  gameSection.scrollIntoView({ behavior: "smooth" });
  await prepareGame();
}

async function prepareGame() {
  if (gameSection.children.length > 0) {
    gameSection.removeChild(gameSection.children[0]);
  }
  const gameData = await getGameData();
  gameSection.insertAdjacentHTML("afterbegin", gameData["game_board"]);
}

async function getGameData() {
  const result = await fetch("http://127.0.0.1:5000/game")
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  return result;
}
