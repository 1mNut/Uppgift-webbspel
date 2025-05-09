import { Player, Enemy } from "./classes.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start");
  const startMenu = document.querySelector(".startMenu");

  const TILE_SIZE = 64;

  const map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  ];

  const tiles = {
    1: new Image(),
    2: new Image(),
  };

  tiles[1].src = "../img/tiles/grass.png";
  tiles[2].src = "../img/tiles/water.png";

  canvas.width = map[0].length * TILE_SIZE;
  canvas.height = map.length * TILE_SIZE;

  const enemies = [];
  const player = spawnPlayer();
  enemies.push(spawnEnemy());

  function spawnPlayer() {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
          return new Player(col * TILE_SIZE, row * TILE_SIZE, 50, 3);
        }
      }
    }
  }

  function spawnEnemy() {
    let spawnTiles = [];
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        if (map[row][col] === 1) {
          spawnTiles.push({ x: col * TILE_SIZE, y: row * TILE_SIZE });
        }
      }
    }
    if (spawnTiles.length === 0) {
      console.error("No valid spawn tiles found!");
      return null;
    }
    const randomTile =
      spawnTiles[Math.floor(Math.random() * spawnTiles.length)];
    return new Enemy(randomTile.x, randomTile.y, 50, 1.5);
  }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        ctx.drawImage(tiles[tileType], x, y, TILE_SIZE, TILE_SIZE);
      }
    }
    player.draw(ctx);
    enemies.forEach((enemy) => {
      enemy.update(player, map, TILE_SIZE);
      enemy.draw(ctx);
    });
  }

  function gameLoop() {
    player.update(map, TILE_SIZE);
    drawGame();
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
        player.dy = -1;
        break;
      case "ArrowDown":
      case "s":
        player.dy = 1;
        break;
      case "ArrowLeft":
      case "a":
        player.dx = -1;
        break;
      case "ArrowRight":
      case "d":
        player.dx = 1;
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
      case "ArrowDown":
      case "s":
        player.dy = 0;
        break;
      case "ArrowLeft":
      case "a":
      case "ArrowRight":
      case "d":
        player.dx = 0;
        break;
    }
  });

  startButton.addEventListener("click", () => {
    startMenu.style.display = "none";
    canvas.style.display = "block";
    gameLoop();
  });
});
