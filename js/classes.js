export class Player { // player klass med fart, hp storlek, spawnpunkt och lite grejer för spriten, draw (ctx) för att rita spriten på canvas och update map för att rita ändra sprite frame och attak animation
  constructor(x, y, size, speed, health, spriteWidth, spriteHeight) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.dx = 0;
    this.dy = 0;
    this.sprite = new Image();
    this.sprite.src = "../img/entities/player.png"; // sprite sheeten
    this.frameX = 0; // kolumn och rad av sprite frame i sheeten.
    this.frameY = 0;
    this.frameWidth = 192; //hur stor varje sprite "frame" är inuti sprite sheeten
    this.frameHeight = 192;
    this.spriteWidth = 75;
    this.spriteHeight = 75;
    this.frameDelay = 5;
    this.frameCounter = 0;
    this.lastDirection = "right"; // för att den ska komma ihåg vilket håll spelaren gick sist så att spriten kollar åt det hållet när man slutar gå
    this.isAttacking = false;
    this.attackCooldown = 0;
  }

  draw(ctx) {
    ctx.save(); // sparar hur canvas såg ut innan

    if (this.lastDirection === "left") { // rätt sprite bilder fast inverted som gör när den går vänster
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
    } else { // tar rätt sprite bilder när spriten går åt höger håll
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

    ctx.restore(); // återställer hur den såg ut tillbaka till save tillståndet som var från början
  }

  update(map, TILE_SIZE) {

    if (this.isAttacking) { //spritens attack animation startas när player trycker på left click

      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.frameX++;


        if (this.frameX >= 6) {  //avsluta animation när sista framen körs
          this.frameX = 0;
          this.isAttacking = false;
        }
      }
      return;
    }

    const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy); // gör så att man inte åker dubbelt så snabbt när man springer diagonellt
    if (magnitude > 0) {
      this.dx /= magnitude;
      this.dy /= magnitude;
    }


    const newX = this.x + this.dx * this.speed;
    const newY = this.y + this.dy * this.speed;
    const tileX1 = Math.floor(newX / TILE_SIZE);
    const tileY1 = Math.floor(newY / TILE_SIZE);
    const tileX2 = Math.floor((newX + this.size - 1) / TILE_SIZE);
    const tileY2 = Math.floor((newY + this.size - 1) / TILE_SIZE);


    //kollar att man är inuti mappen
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
    if (this.frameCounter >= this.frameDelay) { // uppdaterar spring animationen
      this.frameCounter = 0;
      this.frameX = (this.frameX + 1) % 6;
    }

    if (this.dx < 0) { // fixar lastdirection variablen att vara korrekt när man går åt det hållet
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

    if (this.attackCooldown > 0) { //cooldown för attack så att man inte kan slå direkt efter
      this.attackCooldown--;
    }
  }

  attack(enemies) { // attackerar en fiende och gör så att attack animationen utspelas på playern
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
        enemy.takeDamage(25);
      }
    });
  }

  takedamage(enemies) { // ifall player attackerar och en av fienderna är inom räckvidd för att ta skada kollar den igenom arrayen för enemies och deras x y värden för att veta vilken ska bli attackerad och skadad.
    [...enemies].forEach((enemy) => {
      enemy.attack(this);
    });
  }
}

//enemy klassen har ungefär samma inre funktioner som player så jag kommer inte kommentera det igen
export class Enemy { // klassen enemy som har ungefär samma som player med en draw(ctx) för att rita ut spriten på enemy och sedan update för att 
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

  draw(ctx) { // ritar ut fienden på mappen med spriten från spritesheeten
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
      if (this.flashTimer > 0) { // gör röd låda runt fienden när den blir skadad
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.spriteWidth, this.spriteHeight);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  update(player, map, TILE_SIZE) { //hanterar hur fienden rör på sig genom att röra sig mot playerns koordinater på mappen i den speed som är anvigen till den och ritas ut på mappen. Behöver även hantera hur spriten ändras beroende på hur fienden rör på sig
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (dx < 0) {
      this.lastDirection = "left";
    } else if (dx > 0) {
      this.lastDirection = "right";
    }

    if (this.isAttacking) {

      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.frameX++;

        if (this.frameX >= 6) {
          this.frameX = 0;
          this.isAttacking = false;
        }
      }
      return;
    }

    if (distance > this.size) {

      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;

      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.frameX = (this.frameX + 1) % 6;
      }
      this.frameY = 1;
    } else {
      if (this.attackCooldown === 0) {
        this.attack(player);
      }
    }

    if (this.health > 0 && this.flashTimer > 0) {
      this.flashTimer--;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
  }

  takeDamage(amount) { // när playern attackerar fiende så körs denna funktion
    this.health -= amount;
    this.flashTimer = 10;
  }

  attack(player) { // attackerar playern och gör så att attack animationen utspelas på fiende spriten när den slår
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size && this.attackCooldown === 0) { //ifall player är i fiendens räckvid ska spelaren skadas och sedan läggs en cooldown så att man inte blir skadad för snabbt
      player.health -= 10;
      this.attackCooldown = 60;

      this.frameX = 0;
      this.frameY = 2;
      this.isAttacking = true;
    }
  }
}
