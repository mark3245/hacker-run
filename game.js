const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player, cursors, lanes = [80, 180, 280];
let laneIndex = 1;
let speed = 200;
let obstacles, bonuses, score = 0, scoreText;

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('firewall', 'assets/firewall.png');
    this.load.image('laser', 'assets/laser.png');
    this.load.image('glitch', 'assets/glitch.png');
    this.load.image('data', 'assets/data_point.png');
    this.load.image('shield', 'assets/shield.png');
    this.load.image('turbo', 'assets/turbo.png');
    this.load.image('bg', 'assets/background.jpg');
}

function create() {
    this.add.tileSprite(0, 0, 360, 640, 'bg').setOrigin(0).setScrollFactor(0);
    player = this.physics.add.sprite(lanes[laneIndex], 550, 'player').setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerup', handleSwipe, this);

    obstacles = this.physics.add.group();
    bonuses = this.physics.add.group();

    this.time.addEvent({ delay: 1000, callback: spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 3000, callback: spawnBonus, callbackScope: this, loop: true });

    scoreText = this.add.text(10, 10, 'Очки: 0', { font: '18px Arial', fill: '#fff' });
}

function update(time, delta) {
    player.y -= speed * delta / 1000;

    Phaser.Actions.IncY(obstacles.getChildren(), -speed * delta / 1000);
    Phaser.Actions.IncY(bonuses.getChildren(), -speed * delta / 1000);

    this.physics.world.wrap(player, 5);

    this.physics.overlap(player, obstacles, hitObstacle, null, this);
    this.physics.overlap(player, bonuses, collectBonus, null, this);

    score += delta / 20;
    scoreText.setText('Очки: ' + Math.floor(score));
}

function handleSwipe(pointer) {
    const dx = pointer.upX - pointer.downX;
    const dy = pointer.upY - pointer.downY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30 && laneIndex < 2) laneIndex++;
        else if (dx < -30 && laneIndex > 0) laneIndex--;
    }

    player.x = lanes[laneIndex];
}

function spawnObstacle() {
    const type = Phaser.Math.RND.pick(['firewall', 'laser']);
    const x = Phaser.Math.RND.pick(lanes);
    const obj = obstacles.create(x, 0, type);
    obj.setVelocityY(speed);
}

function spawnBonus() {
    const type = Phaser.Math.RND.pick(['data', 'shield', 'turbo']);
    const x = Phaser.Math.RND.pick(lanes);
    const bonus = bonuses.create(x, 0, type);
    bonus.setVelocityY(speed);
}

function hitObstacle(player, obstacle) {
    this.scene.pause();
    alert('Игра окончена! Ваш результат: ' + Math.floor(score));
    location.reload();
}

function collectBonus(player, bonus) {
    score += 100;
    bonus.destroy();
}
