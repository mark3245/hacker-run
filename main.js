const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let lanes = [90, 180, 270];
let currentLane = 1;
let obstacles;
let speed = 200;
let score = 0;
let scoreText;
let gameOver = false;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
  this.add.tileSprite(0, 0, 360, 640, 'background').setOrigin(0).setScrollFactor(0);

  player = this.physics.add.sprite(lanes[currentLane], 540, 'player');
  player.setCollideWorldBounds(true);

  obstacles = this.physics.add.group();
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  scoreText = this.add.text(10, 10, 'Счёт: 0', { fontSize: '20px', fill: '#fff' });

  cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerup', handleSwipe, this);

  this.time.addEvent({
    delay: 1500,
    callback: spawnObstacle,
    callbackScope: this,
    loop: true
  });
}

function update() {
  if (gameOver) return;

  player.y -= 1.5;
  score += 1;
  scoreText.setText('Счёт: ' + Math.floor(score / 10));
}

function handleSwipe(pointer) {
  let dx = pointer.upX - pointer.downX;
  if (Math.abs(dx) > 30) {
    if (dx > 0 && currentLane < 2) currentLane++;
    else if (dx < 0 && currentLane > 0) currentLane--;
    player.x = lanes[currentLane];
  }
}

function spawnObstacle() {
  const lane = Phaser.Math.Between(0, 2);
  const obstacle = obstacles.create(lanes[lane], 0, 'obstacle');
  obstacle.setVelocityY(speed);
  obstacle.setImmovable(true);
}

function hitObstacle() {
  gameOver = true;
  this.physics.pause();
  scoreText.setText('Игра окончена!\nСчёт: ' + Math.floor(score / 10));
}
