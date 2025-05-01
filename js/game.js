document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start");
  const startMenu = document.querySelector(".startMenu");

  const TILE_SIZE = 64;

  const map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2],
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

  class Player {
    constructor(x, y, size, speed) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = speed;
      this.dx = 0;
      this.dy = 0;
    }

    draw() {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
      const newX = this.x + this.dx * this.speed;
      const newY = this.y + this.dy * this.speed;

      const tileX1 = Math.floor(newX / TILE_SIZE);
      const tileY1 = Math.floor(newY / TILE_SIZE);
      const tileX2 = Math.floor((newX + this.size - 1) / TILE_SIZE);
      const tileY2 = Math.floor((newY + this.size - 1) / TILE_SIZE);

      if (
        tileY1 >= 0 &&
        tileY2 < map.length &&
        tileX1 >= 0 &&
        tileX2 < map[0].length &&
        map[tileY1][tileX1] === 1 &&
        map[tileY1][tileX2] === 1 &&
        map[tileY2][tileX1] === 1 &&
        map[tileY2][tileX2] === 1
      ) {
        this.x = newX;
        this.y = newY;
      }
    }
  }

  let playerX = 0;
  let playerY = 0;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        playerX = col * TILE_SIZE;
        playerY = row * TILE_SIZE;
        break;
      }
    }
    if (playerX !== 0 || playerY !== 0) break;
  }

  const player = new Player(playerX, playerY, 50, 3);

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

    player.draw();
  }

  function gameLoop() {
    player.update();
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

  let tilesLoaded = 0;
  const totalTiles = Object.keys(tiles).length;

  for (const key in tiles) {
    tiles[key].onload = () => {
      tilesLoaded++;
      if (tilesLoaded === totalTiles) {
        startButton.addEventListener("click", () => {
          startMenu.style.display = "none";
          canvas.style.display = "block";
          gameLoop();
        });
      }
    };
  }
});
