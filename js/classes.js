export class Player {
  constructor(x, y, size, speed, health, spriteWidth, spriteHeight) {
    this.x = x;
    this.y = y;
    this.size = size; // Hitbox size
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
    this.spriteWidth = 75; // Width of the sprite
    this.spriteHeight = 75; // Height of the sprite
    this.frameDelay = 5;
    this.frameCounter = 0;
    this.lastDirection = "right";
    this.isAttacking = false;
    this.attackCooldown = 0;
  }

  draw(ctx) {
    ctx.save();

    if (this.lastDirection === "left") {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.sprite,
        this.frameX * this.frameWidth,
        this.frameY * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        -(this.x + this.size + 70),
        this.y,
        this.spriteWidth,
        this.spriteHeight
      );
    } else {
      ctx.drawImage(
        this.sprite,
        this.frameX * this.frameWidth,
        this.frameY * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.spriteWidth,
        this.spriteHeight
      );
    }

    ctx.restore();
  }

  update(map, TILE_SIZE) {
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
      tileX2 < map[0].length
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

    enemies.forEach((enemy) => {
      const dx = this.x - enemy.x;
      const dy = this.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.size) {
        enemy.takeDamage(25); // Just damage, don't remove here!
      }
    });
  }

  takedamage(enemies) {
    [...enemies].forEach((enemy) => {
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
    this.flashTimer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frameWidth = 192;
    this.frameHeight = 192;
    this.frameDelay = 5;
    this.frameCounter = 0;
    this.spriteWidth = 75;
    this.spriteHeight = 75;
    this.lastDirection = "right";
  }

  draw(ctx) {
    ctx.save();

    if (this.lastDirection === "left") {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.sprite,
        this.frameX * this.frameWidth,
        this.frameY * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        -(this.x + this.spriteWidth),
        this.y,
        this.spriteWidth,
        this.spriteHeight
      );
      if (this.flashTimer > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "red";
        ctx.fillRect(-(this.x + this.spriteWidth), this.y, this.spriteWidth, this.spriteHeight);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.drawImage(
        this.sprite,
        this.frameX * this.frameWidth,
        this.frameY * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.spriteWidth,
        this.spriteHeight
      );
      if (this.flashTimer > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.spriteWidth, this.spriteHeight);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  update(player, map, TILE_SIZE) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Set direction based on player position
    if (dx < 0) {
      this.lastDirection = "left";
    } else if (dx > 0) {
      this.lastDirection = "right";
    }

    // Move towards player if not in attack range
    if (distance > this.size) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;

      // Animation: running
      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.frameX = (this.frameX + 1) % 6; // Assuming 6 frames for running
      }
      this.frameY = 0; // Set to the correct row for running animation
    } else {
      // Animation: idle or attack
      this.frameX = 0;
      this.frameY = 1; // Set to the correct row for idle/attack
    }

    if (this.health > 0) {
      if (this.flashTimer > 0) {
        this.flashTimer--;
      }
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.flashTimer = 10; // Flash for 10 frames
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
