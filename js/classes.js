export class Player {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.dx = 0;
    this.dy = 0;
  }

  draw(ctx) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update(map, TILE_SIZE) {
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

export class Enemy {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update(player, map, TILE_SIZE) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
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
}
