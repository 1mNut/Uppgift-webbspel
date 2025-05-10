export class Player {
  constructor(x, y, size, speed, health) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.dx = 0;
    this.dy = 0;
    this.sprite = new Image();
    this.sprite.src = "../img/entities/player.png";
    this.frameX = 0;
    this.frameY = 0;
    this.frameWidth = 192;
    this.frameHeight = 192;
    this.frameDelay = 5;
    this.frameCounter = 0;
    this.lastDirection = "right";
    this.isAttacking = false;
    this.attackCooldown = 0;
  }

draw(ctx) {
  ctx.save();

  const offsetX = 75;
  const offsetY = 75;

  if (this.lastDirection === "left") {
    ctx.scale(-1, 1);
    ctx.drawImage(
      this.sprite,
      this.frameX * this.frameWidth,
      this.frameY * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      -(this.x + this.size - offsetX),
      this.y - offsetY,
      this.size,
      this.size
    );
  } else {
    ctx.drawImage(
      this.sprite,
      this.frameX * this.frameWidth,
      this.frameY * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x - offsetX,
      this.y - offsetY,
      this.size,
      this.size
    );
  }

  ctx.restore();
}

  update(map, TILE_SIZE, walkableTiles) {

        if (this.isAttacking) {
      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.frameX = (this.frameX + 1) % 6;
        if (this.frameX === 0) {
          this.isAttacking = false;
        }
      }
      return;
    }

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
      walkableTiles.includes(map[tileY1][tileX1]) &&
      walkableTiles.includes(map[tileY1][tileX2]) &&
      walkableTiles.includes(map[tileY2][tileX1]) &&
      walkableTiles.includes(map[tileY2][tileX2])
    ) {
      this.x = newX;
      this.y = newY;
    }
    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.frameX = (this.frameX + 1) % 6;
    }
    if (this.dx < 0) {
      this.lastDirection = "left";
      this.frameY = 1;
    } else if (this.dx > 0) {
      this.lastDirection = "right";
      this.frameY = 1;
    } else if (this.dy !== 0) {
      this.frameY = 1;
    } else {
      this.frameY = 0;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }

attack(enemies) {
  if (this.attackCooldown > 0) return;

  this.isAttacking = true;
  this.frameX = 0;
  this.frameY = 2;
  this.attackCooldown = 30;

  enemies.forEach((enemy, index) => {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.size) {
      enemy.health -= 25;
      if (enemy.health <= 0) {
        enemies.splice(index, 1);
      }
    }
  });
}

  takedamage(enemies) {
  enemies.forEach((enemy) => {
    enemy.attack(this);
  });
}
}

export class Enemy {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = 50;
    this.attackCooldown = 0;
    this.sprite = new Image();
    this.sprite.src = "../img/entities/enemy.png";
    this.frameX = 0;
    this.frameY = 0;
    this.frameWidth = 192;
    this.frameHeight = 192;
    this.frameDelay = 5;
    this.frameCounter = 0;
  }

  draw(ctx) {
    const offsetX = 75;
    const offsetY = 75;

    ctx.drawImage(
      this.sprite,
      this.frameX * this.frameWidth,
      this.frameY * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      this.x - offsetX,
      this.y - offsetY,
      this.size,
      this.size
    );
  }

  update(player, map, TILE_SIZE, walkableTiles) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);


    if (distance < this.size) {

      if (this.attackCooldown === 0) {
        this.attack(player);
      }
    } else {

      const newX = this.x + (dx / distance) * this.speed;
      const newY = this.y + (dy / distance) * this.speed;
      const tileX1 = Math.floor(newX / TILE_SIZE);
      const tileY1 = Math.floor(newY / TILE_SIZE);
      const tileX2 = Math.floor((newX + this.size - 1) / TILE_SIZE);
      const tileY2 = Math.floor((newY + this.size - 1) / TILE_SIZE);
      if (
        tileY1 >= 0 &&
        tileY2 < map.length &&
        tileX1 >= 0 &&
        tileX2 < map[0].length &&
        walkableTiles.includes(map[tileY1][tileX1]) &&
        walkableTiles.includes(map[tileY1][tileX2]) &&
        walkableTiles.includes(map[tileY2][tileX1]) &&
        walkableTiles.includes(map[tileY2][tileX2])
      ) {
        this.x = newX;
        this.y = newY;
      }
    }

    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.frameX = (this.frameX + 1) % 6;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }

 attack(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size && this.attackCooldown === 0) {
      player.health -= 10;
      this.attackCooldown = 60;

      this.frameX = 0;
      this.frameY = 1;
    }
  }
}