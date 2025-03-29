function startMenu() {
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const pickDoor = document.getElementById("doors");
  const slideMenu = document.getElementById("menu");

  slideMenu.style.display = "none";

  startButton.addEventListener("click", () => {
    startMenu.style.display = "none";
    pickDoor.style.display = "block";

    slideMenu.style.display = "flex";

    startGame();
  });
}

function startGame() {
  console.log("Game started!");
  const doors = document.querySelectorAll(".door");

  doors.forEach((door) => {
    door.addEventListener("click", () => {
      handleDoorClick(door);
    });
  });
}

function handleDoorClick(door) {
  makeRoom();
}

function makeRoom() {
  let randomRoom = Math.floor(Math.random() * 3 + 1);
  if (randomRoom === 1) {
    item();
  } else if (randomRoom === 2) {
    trap();
  } else if (randomRoom === 3) {
    battle();
  }
}

function item() {
  const gameItem = document.getElementById("item");
  const pickDoor = document.getElementById("doors");
  gameItem.style.display = "block";
  pickDoor.style.display = "none";
}

function trap() {
  const gameTrap = document.getElementById("trap");
  const pickDoor = document.getElementById("doors");
  gameTrap.style.display = "block";
  pickDoor.style.display = "none";
}

function battle() {
  const gameBattle = document.getElementById("battle");
  const pickDoor = document.getElementById("doors");
  gameBattle.style.display = "block";
  pickDoor.style.display = "none";
}

window.onload = startMenu;
