const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 360,
    height: 640,
    backgroundColor: "#000000",
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MainScene]
};

let game = new Phaser.Game(config);

function getSwipeDirection(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
}

class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
      this.load.image('player', 'assets/player.png');
      this.load.image('firewall', 'assets/firewall.png');
      this.load.image('laser', 'assets/laser.png');
      this.load.image('glitch', 'assets/glitch.png');
      this.load.image('data', 'assets/data.png');
      this.load.image('shield', 'assets/shield.png');
      this.load.image('turbo', 'assets/turbo.png');
      this.load.image('background', 'assets/background.png');
  }

    create() {
        this.score = 0;
        this.shield = false;
        this.isTurbo = false;

        this.background = this.add.tileSprite(0, 0, 360, 640, "background").setOrigin(0, 0);
        this.player = this.physics.add.sprite(180, 550, "player").setScale(0.6);

        this.lanes = [100, 180, 260];
        this.currentLane = 1;
        this.player.x = this.lanes[this.currentLane];

        this.obstacles = this.physics.add.group();
        this.bonuses = this.physics.add.group();

        this.physics.add.overlap(this.player, this.obstacles, this.handleObstacleCollision, null, this);
        this.physics.add.overlap(this.player, this.bonuses, this.handleBonusCollision, null, this);

        this.input.on("pointerdown", (pointer) => (this.touchStart = pointer));
        this.input.on("pointerup", (pointer) => {
            const dir = getSwipeDirection(this.touchStart, pointer);
            this.handleSwipe(dir);
        });

        this.scoreText = this.add.text(10, 10, "Счёт: 0", { fontSize: "20px", fill: "#fff" });

        this.timer = this.time.addEvent({ delay: 1000, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.bonusTimer = this.time.addEvent({ delay: 3000, callback: this.spawnBonus, callbackScope: this, loop: true });
    }

    update() {
        this.background.tilePositionY -= this.isTurbo ? 8 : 4;
        this.score += this.isTurbo ? 2 : 1;
        this.scoreText.setText("Счёт: " + this.score);
    }

    handleSwipe(direction) {
        if (direction === "left" && this.currentLane > 0) this.currentLane--;
        else if (direction === "right" && this.currentLane < 2) this.currentLane++;
        this.player.x = this.lanes[this.currentLane];
    }

    spawnObstacle() {
        const type = Phaser.Math.RND.pick(["firewall", "laser", "glitch"]);
        const lane = Phaser.Math.Between(0, 2);
        const obstacle = this.obstacles.create(this.lanes[lane], -50, type).setVelocityY(this.isTurbo ? 300 : 200);
    }

    spawnBonus() {
        const type = Phaser.Math.RND.pick(["data", "shield", "turbo"]);
        const lane = Phaser.Math.Between(0, 2);
        const bonus = this.bonuses.create(this.lanes[lane], -50, type).setVelocityY(150);
    }

    handleObstacleCollision(player, obstacle) {
        if (this.shield) {
            obstacle.destroy();
            this.shield = false;
        } else if (!this.isTurbo) {
            this.physics.pause();
            this.add.text(80, 300, "Вы проиграли", { fontSize: "28px", fill: "#fff" });
            this.time.removeAllEvents();
        }
    }

    handleBonusCollision(player, bonus) {
        const type = bonus.texture.key;
        bonus.destroy();

        if (type === "data") this.score += 100;
        if (type === "shield") this.shield = true;
        if (type === "turbo") {
            this.isTurbo = true;
            this.time.delayedCall(4000, () => (this.isTurbo = false));
        }
    }
}
