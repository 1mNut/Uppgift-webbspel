import { map, tileset, tileSources, TILE_SIZE } from "./map.js";
import { Player, Enemy } from "./classes.js";

document.addEventListener("DOMContentLoaded", () => { // kör koden på en gång man laddar in i hemsidan
  const canvas = document.getElementById("gameCanvas"); // laddar in en massa grejer från html koden för att göra knappar och sätta display none på vissa ställen för senare användning inom koden
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

  let gameRunning = false; // variabler som behövs genom dokumentet för funktionerna
  let paused = false;
  let enemies = [];
  let player = spawnPlayer();
  let remainingEnemies = 2;
  let mapOffsetX = 0;
  let mapOffsetY = 0;
  let eliminationCount = 0;

  canvas.width = map[0].length * TILE_SIZE; // fixar canvas storlek beroende på hur mapp arrayen ser ut
  canvas.height = map.length * TILE_SIZE;

  enemies.push(spawnEnemy()); //spawnar den första fienden

  function spawnPlayer() { //funktion att spawna playern
    return new Player(75, 75, 10, 2, 100, 50);
  }

  function spawnEnemy() {
    //spawnar en fiende på spawn punkten vi har valt ut
    const centerCol = Math.floor(map[0].length / 2);
    const centerRow = Math.floor(map.length / 2);
    const x = centerCol * TILE_SIZE;
    const y = centerRow * TILE_SIZE;

    return new Enemy(x, y, 10, 1);
  }

  function updateMenu() { // funktion för att visa hp:et genom html koden och uppdaterar den när man tar skada
    menu.innerHTML = `
    Health: ${player.health}<br>
    Enemies eliminated: ${eliminationCount}
  `;
  }

  function drawGame() { // ritar upp mappen, fienden och spelaren
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

  let totalSpawnedEnemies = 1; // antal fiender som har spawnats

  function startEnemySpawnTimer() { // spawn timer funktion som hanterar när spelet ska spawna nästa fiende så länge det finns max 3 fiender spawnar den
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

  function gameLoop() { // huvud loopen för spelet 
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

      drawGame(); // ritar om canvasen varje frame
      requestAnimationFrame(gameLoop);
    } else { //händelser som händer när man dör

      gameRunning = false;
      canvas.style.display = "none";
      menu.style.display = "none";
      endMenu.style.display = "flex";
    }
  }

  function resetGame() { // återställer allt för att kunna köra igen
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
// attack knapp men ska inte fungera ifall man är på start skärmen annars när start knappen trycks så ser man hur gubben i början av spelet gör ett slag som ser konstigt ut
  document.addEventListener("mousedown", (event) => {
    if (event.button === 0 && startMenu.style.display === "none") {
      player.attack(enemies);
    }
  });
// ta upp escape menyn där man kan restarta gamet eller bara hålla spelet pausat i den statet det var i precis innan
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
// knappar för att komma till andra displays/menyer
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
