import { map, tileset, tileSources, walkableTiles, TILE_SIZE } from "./map.js";
import { Player, Enemy } from "./classes.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start");
  const menu = document.getElementById("menu");
  const againButton = document.getElementById("try-again");
  const restartButton = document.getElementById("restartButton");
  const quitButton = document.getElementById("quitButton");
  const startMenu = document.querySelector(".startMenu");
  const endMenu = document.querySelector(".endMenu");
  const pauseMenu = document.querySelector(".pauseMenu");
  const winMenu = document.querySelector(".winMenu");

  let gameRunning = false;
  let paused = false;
  let enemies = [];
  let player = spawnPlayer();
  let remainingEnemies = 5;

  canvas.width = map[0].length * TILE_SIZE;
  canvas.height = map.length * TILE_SIZE;

  enemies.push(spawnEnemy());

  function spawnPlayer() {
    return new Player(75, 75, 75, 2, 100, 50);
  }

  function spawnEnemy() {
    let spawnTiles = [];
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        if (walkableTiles.includes(map[row][col])) {
          spawnTiles.push({ x: col * TILE_SIZE, y: row * TILE_SIZE });
        }
      }
    }

    if (spawnTiles.length === 0) {
      return null;
    }

    const randomTile =
      spawnTiles[Math.floor(Math.random() * spawnTiles.length)];

    const enemySize = 75;
    const maxX = map[0].length * TILE_SIZE - enemySize;
    const maxY = map.length * TILE_SIZE - enemySize;

    const spawnX = Math.min(randomTile.x, maxX);
    const spawnY = Math.min(randomTile.y, maxY);

    return new Enemy(spawnX, spawnY, enemySize, 1.5);
  }

  function updateMenu() {
    menu.innerHTML = `
    Health: ${player.health}`;
  }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];
        const { sx, sy } = tileSources[tileType];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        ctx.drawImage(
          tileset,
          sx,
          sy,
          TILE_SIZE,
          TILE_SIZE,
          x,
          y,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }

    player.draw(ctx);
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
    });

    updateMenu();
  }

  let totalSpawnedEnemies = 1;

  function startEnemySpawnTimer() {
    const spawnInterval = setInterval(() => {
      if (totalSpawnedEnemies < 5) {
        const newEnemy = spawnEnemy();
        if (newEnemy) {
          enemies.push(newEnemy);
          totalSpawnedEnemies++;
        }
      } else {
        clearInterval(spawnInterval);
      }
    }, 4000);
  }

  function gameLoop() {
    if (!gameRunning || paused) return;

    if (player.health > 0) {
      player.update(map, TILE_SIZE, walkableTiles);
      player.takedamage(enemies);

      enemies.forEach((enemy, index) => {
        enemy.update(player, map, TILE_SIZE, walkableTiles);

        // Check if enemy is defeated
        if (enemy.health <= 0) {
          enemies.splice(index, 1);
          remainingEnemies--;

          // Spawn the next enemy if there are more remaining
          if (remainingEnemies > 0) {
            enemies.push(spawnEnemy());
          } else if (remainingEnemies === 0) {
            gameRunning = false;
            canvas.style.display = "none";
            menu.style.display = "none";
            winMenu.style.display = "flex";
          }
        }
      });

      drawGame();
      requestAnimationFrame(gameLoop);
    } else {
      // Lose condition
      gameRunning = false;
      canvas.style.display = "none";
      menu.style.display = "none";
      endMenu.style.display = "flex";
    }
  }

  function resetGame() {
    player = spawnPlayer();
    enemies = [spawnEnemy()];
    remainingEnemies = 5;
    gameRunning = true;
    canvas.style.display = "block";
    menu.style.display = "block";
    endMenu.style.display = "none";
    gameLoop();
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

  document.addEventListener("mousedown", (event) => {
    if (event.button === 0 && startMenu.style.display === "none") {
      player.attack(enemies);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && startMenu.style.display === "none") {
      paused = !paused;

      if (paused) {
        pauseMenu.style.display = "flex";
      } else {
        pauseMenu.style.display = "none";
        gameLoop();
      }
    }
  });

  startButton.addEventListener("click", () => {
    startMenu.style.display = "none";
    canvas.style.display = "block";
    menu.style.display = "block";
    gameRunning = true;
    startEnemySpawnTimer();
    gameLoop();
  });

  againButton.addEventListener("click", () => {
    resetGame();
  });

  restartButton.addEventListener("click", () => {
    paused = false;
    pauseMenu.style.display = "none";
    resetGame();
  });
});
