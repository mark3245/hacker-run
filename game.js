const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let score = 0;
let obstacles;
let dataBonus;
let shield;
let turbo;
let isTurboActive = false;

let game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('firewall', 'assets/firewall.png');
    this.load.image('laser', 'assets/laser.png');
    this.load.image('glitch', 'assets/glitch.png');
    this.load.image('data', 'assets/data.png');
    this.load.image('shield', 'assets/shield.png');
    this.load.image('turbo', 'assets/turbo.png');
}

function create() {
    player = this.physics.add.image(200, 550, 'player');
    player.setCollideWorldBounds(true);
    
    obstacles = this.physics.add.group();
    dataBonus = this.physics.add.group();
    shield = this.physics.add.group();
    turbo = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', pointerDown, this);

    // Интеграция с Telegram API для отправки очков
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
    }

    // Анимация меню
    this.add.text(100, 100, 'Hacker Run', { fontSize: '32px', fill: '#fff' });
    this.add.text(100, 150, 'Swipe to Play', { fontSize: '24px', fill: '#ff00ff' });

    // Генерация препятствий
    this.time.addEvent({
        delay: 1000,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });
}

function update() {
    // Управление через свайпы
    if (cursors.left.isDown || Phaser.Input.Pointer.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown || Phaser.Input.Pointer.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    } else {
        player.setVelocityY(0);
    }
    
    // Проверка столкновений
    this.physics.world.collide(player, obstacles, hitObstacle, null, this);
    this.physics.world.collide(player, dataBonus, collectData, null, this);
    this.physics.world.collide(player, shield, collectShield, null, this);
    this.physics.world.collide(player, turbo, collectTurbo, null, this);
}

function pointerDown(pointer) {
    // Реализация свайпов
    if (pointer.x < 200) {
        player.setVelocityX(-160);
    } else {
        player.setVelocityX(160);
    }
}

function spawnObstacle() {
    const x = Phaser.Math.Between(50, 350);
    const obstacle = obstacles.create(x, 0, 'firewall');
    obstacle.setVelocityY(Phaser.Math.Between(100, 200));
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    score = Math.floor(score);

    // Отправка очков в Telegram
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({ score }));
    }

    alert(`Игра окончена! Ваш результат: ${score}`);
    location.reload();
}

function collectData(player, data) {
    data.destroy();
    score += 10;
}

function collectShield(player, shield) {
    shield.destroy();
    player.setTint(0x00ff00);  // Покрасить игрока в зелёный
    setTimeout(() => player.clearTint(), 3000);
}

function collectTurbo(player, turbo) {
    turbo.destroy();
    isTurboActive = true;
    player.setVelocityX(320);
    player.setVelocityY(320);
    setTimeout(() => isTurboActive = false, 3000);
}
