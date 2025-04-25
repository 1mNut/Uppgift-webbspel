// -----------------------------------------------
// kod för egen muspekare
const cursor = document.getElementById("cursor");

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});
// kod för egen muspekare
// ----------------------------------------------

function startMenu() {
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const chooseName = document.getElementById("choose-name");

  startButton.addEventListener("click", () => {
    startMenu.style.display = "none";
    chooseName.style.display = "block";

    createName();
  });
}

function createName() {
  const pickDoor = document.getElementById("doors");
  const submitButton = document.getElementById("submit-button");
  const slideMenu = document.getElementById("menu");
  const chooseName = document.getElementById("choose-name");
  const userInput = document.getElementById("user-input");

  submitButton.addEventListener("click", () => {
    const playerName = userInput.value.trim();

    if (playerName === "") {
      alert("Please enter a valid name!");
      return;
    }

    const player = new Player(playerName, 100, 20);

    chooseName.style.display = "none";
    pickDoor.style.display = "block";
    slideMenu.style.display = "flex";
    slideMenu.style.flexDirection = "column";
    startGame(player);
  });
}

function startGame(player) {
  console.log(`Game started with player:${player.name}`);
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

class Player {
  constructor(name, health, attack) {
    this.name = name;
    this.health = health;
    this.attack = attack;
  }
}

const ItemClasses = [
  "img/item/1.png",
  "img/item/2.png",
  "img/item/3.png",
  "img/item/4.png",
  "img/item/5.png",
  "img/item/0.png",
];

function randomItemClass() {
  const randomindex = Math.floor(Math.random() * 6);
  const randomItem = ItemClasses[randomindex];
  return randomItem;
}

window.onload = startMenu;
