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
  const playAgainButton = document.getElementById("play-again");

  let gameRunning = false;
  let paused = false;
  let enemies = [];
  let player = spawnPlayer();
  let remainingEnemies = 2;
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

    const centerCol = Math.floor(map[0].length / 2);
    const centerRow = Math.floor(map.length / 2);
    const x = centerCol * TILE_SIZE;
    const y = centerRow * TILE_SIZE;

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

    player.draw(ctx);
    enemies.forEach((enemy) => enemy.draw(ctx));
    updateMenu();
  }

  let totalSpawnedEnemies = 1;

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


      [...enemies].forEach((enemy, index) => {
        enemy.update(player, map, TILE_SIZE);


        if (enemy.health <= 0) { // kollar ifall en fiende är död
          const enemyIndex = enemies.indexOf(enemy);
          if (enemyIndex !== -1) {
            enemies.splice(enemyIndex, 1);
            remainingEnemies--;
            eliminationCount++;
          }

          if (eliminationCount === 3) { //ifall man dödar 3 gubbar vinner man
            gameRunning = false;
            canvas.style.display = "none";
            menu.style.display = "none";
            winMenu.style.display = "flex";
          }

          else if (remainingEnemies > 0 && totalSpawnedEnemies < 3) {
            enemies.push(spawnEnemy());
            totalSpawnedEnemies++;
          }
        }
      });

      drawGame();
      requestAnimationFrame(gameLoop);
    } else { //händelser som händer när man dör

      gameRunning = false;
      canvas.style.display = "none";
      menu.style.display = "none";
      endMenu.style.display = "flex";
    }
  }

  function resetGame() {
    player = spawnPlayer();
    enemies = [spawnEnemy()];
    remainingEnemies = 2;
    eliminationCount = 0;
    totalSpawnedEnemies = 1;
    gameRunning = true;
    canvas.style.display = "block";
    menu.style.display = "block";
    endMenu.style.display = "none";
    gameLoop();
  }



  const keysPressed = {};  //kod för knapptryckning för att flytta playern:

  document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;

    player.dx = 0;
    player.dy = 0;
    if (keysPressed["ArrowUp"] || keysPressed["w"]) player.dy = -1;
    if (keysPressed["ArrowDown"] || keysPressed["s"]) player.dy = 1;
    if (keysPressed["ArrowLeft"] || keysPressed["a"]) player.dx = -1;
    if (keysPressed["ArrowRight"] || keysPressed["d"]) player.dx = 1;
  });

  document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;

    player.dx = 0;
    player.dy = 0;
    if (keysPressed["ArrowUp"] || keysPressed["w"]) player.dy = -1;
    if (keysPressed["ArrowDown"] || keysPressed["s"]) player.dy = 1;
    if (keysPressed["ArrowLeft"] || keysPressed["a"]) player.dx = -1;
    if (keysPressed["ArrowRight"] || keysPressed["d"]) player.dx = 1;
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
