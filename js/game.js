import { map, tileset, tileSources, TILE_SIZE } from "./map.js";
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
  const playAgainButton = document.getElementById("play-again"); // Add this line

  let gameRunning = false;
  let paused = false;
  let enemies = [];
  let player = spawnPlayer();
  let remainingEnemies = 2; // Only 2 more after the first
  let mapOffsetX = 0;
  let mapOffsetY = 0;
  let eliminationCount = 0;

  canvas.width = map[0].length * TILE_SIZE;
  canvas.height = map.length * TILE_SIZE;

  enemies.push(spawnEnemy());

  function spawnPlayer() {
    return new Player(75, 75, 10, 2, 100, 50);
  }

  function spawnEnemy() {
    // Calculate the center tile
    const centerCol = Math.floor(map[0].length / 2);
    const centerRow = Math.floor(map.length / 2);
    const x = centerCol * TILE_SIZE;
    const y = centerRow * TILE_SIZE;

    // Create a new enemy at the center of the map
    return new Enemy(x, y, 10, 1);
  }

  function updateMenu() {
    menu.innerHTML = `
    Health: ${player.health}<br>
    Enemies eliminated: ${eliminationCount}
  `;
  }

  function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const tileType = map[row][col];
        const { sx, sy } = tileSources[tileType];
        const x = col * TILE_SIZE + mapOffsetX;
        const y = row * TILE_SIZE + mapOffsetY;

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

    player.draw(ctx); // No offset here!
    enemies.forEach((enemy) => enemy.draw(ctx));
    updateMenu();
  }

  let totalSpawnedEnemies = 1; // Already spawned 1 at start

  function startEnemySpawnTimer() {
    const spawnInterval = setInterval(() => {
      if (totalSpawnedEnemies < 3) {
        const newEnemy = spawnEnemy();
        if (newEnemy) {
          enemies.push(newEnemy);
          totalSpawnedEnemies++;
          remainingEnemies++;
        }
      } else {
        clearInterval(spawnInterval);
      }
    }, 4000);
  }

  function gameLoop() {
    if (!gameRunning || paused) return;

    if (player.health > 0) {
      player.update(map, TILE_SIZE);
      player.takedamage(enemies);

      // Iterate over a copy of the enemies array
      [...enemies].forEach((enemy, index) => {
        enemy.update(player, map, TILE_SIZE);

        // Check if enemy is defeated
        if (enemy.health <= 0) {
          enemies.splice(index, 1);
          remainingEnemies--;
          eliminationCount++; // Increment the count here

          // Trigger win screen after 3 kills
          if (eliminationCount === 3) {
            gameRunning = false;
            canvas.style.display = "none";
            menu.style.display = "none";
            winMenu.style.display = "flex";
          }
          // Spawn the next enemy if there are more remaining and not yet 3 kills
          else if (remainingEnemies > 0 && totalSpawnedEnemies < 3) {
            enemies.push(spawnEnemy());
            totalSpawnedEnemies++;
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
    remainingEnemies = 2; // Only 2 more after the first
    eliminationCount = 0; // Reset the count here
    totalSpawnedEnemies = 1; // Reset to 1
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
    window.location.reload();
  });

  restartButton.addEventListener("click", () => {
    paused = false;
    pauseMenu.style.display = "none";
    resetGame();
  });

  playAgainButton.addEventListener("click", () => {
    window.location.href = "index.htm";
  });
});
