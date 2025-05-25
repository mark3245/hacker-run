class HackerRun {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#000000',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 },
                    debug: false
                }
            },
            scene: [PreloadScene, MainMenu, GameScene, GameOver, PvPScene],
            input: {
                activePointers: 3
            }
        };

        this.game = new Phaser.Game(this.config);
        this.initTelegram();
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.TelegramWebApp = window.Telegram.WebApp;
            this.TelegramWebApp.expand();
            this.TelegramWebApp.enableClosingConfirmation();
            
            // Получаем параметры из URL
            const urlParams = new URLSearchParams(window.location.search);
            this.gameMode = urlParams.get('mode') || 'solo';
            this.userId = urlParams.get('id') || 'guest';
        }
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        // Прогресс бар
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const { width, height } = this.cameras.main;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Загрузка ассетов
        this.load.image('background', 'assets/background.png');
        this.load.image('cyber_city', 'assets/cyber_city.png');
        this.load.image('road', 'assets/road.png');
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('firewall', 'assets/firewall.png');
        this.load.image('laser', 'assets/laser.png');
        this.load.image('glitch', 'assets/glitch.png');
        this.load.image('data', 'assets/data.png');
        this.load.image('shield', 'assets/shield.png');
        this.load.image('turbo', 'assets/turbo.png');
        this.load.image('start_btn', 'assets/start_btn.png');
        this.load.image('pvp_btn', 'assets/pvp_btn.png');
        this.load.image('leaderboard_btn', 'assets/leaderboard_btn.png');
        this.load.image('shop_btn', 'assets/shop_btn.png');
        
        // Загрузка звуков
        this.load.audio('run', 'assets/sounds/run.mp3');
        this.load.audio('jump', 'assets/sounds/jump.mp3');
        this.load.audio('collect', 'assets/sounds/collect.mp3');
        this.load.audio('crash', 'assets/sounds/crash.mp3');
        this.load.audio('music', 'assets/sounds/music.mp3');
        this.load.audio('pvp_win', 'assets/sounds/pvp_win.mp3');
        this.load.audio('pvp_lose', 'assets/sounds/pvp_lose.mp3');
        
        // Шрифты
        this.load.bitmapFont('digital', 'fonts/digital.png', 'fonts/digital.fnt');
    }

    create() {
        this.scene.start('MainMenu');
    }
}

class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Фон
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'cyber_city')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Название игры
        this.add.bitmapText(this.cameras.main.centerX, 150, 'digital', 'HACKER RUN', 64)
            .setOrigin(0.5)
            .setTint(0x00ff00);
        
        // Кнопки
        const playButton = this.add.image(this.cameras.main.centerX, 300, 'start_btn')
            .setInteractive()
            .setScale(0.8);
        
        const pvpButton = this.add.image(this.cameras.main.centerX, 380, 'pvp_btn')
            .setInteractive()
            .setScale(0.8);
        
        const leaderboardButton = this.add.image(this.cameras.main.centerX, 460, 'leaderboard_btn')
            .setInteractive()
            .setScale(0.8);
        
        const shopButton = this.add.image(this.cameras.main.centerX, 540, 'shop_btn')
            .setInteractive()
            .setScale(0.8);
        
        // Обработчики кнопок
        playButton.on('pointerdown', () => {
            this.scene.start('Game', { isPvP: false });
        });
        
        pvpButton.on('pointerdown', () => {
            if (window.Telegram && window.Telegram.WebApp) {
                this.scene.start('PvPLobby');
            } else {
                this.scene.start('Game', { isPvP: true });
            }
        });
        
        leaderboardButton.on('pointerdown', () => {
            this.showLeaderboard();
        });
        
        shopButton.on('pointerdown', () => {
            this.showShop();
        });
        
        // Анимация кнопок
        this.tweens.add({
            targets: [playButton, pvpButton, leaderboardButton, shopButton],
            y: '+=10',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
        
        // Музыка меню
        this.music = this.sound.add('music', { loop: true, volume: 0.5 });
        this.music.play();
    }
    
    showLeaderboard() {
        // Заглушка для таблицы лидеров
        const leaderboard = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        
        const bg = this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRoundedRect(-200, -200, 400, 400, 16);
        
        const title = this.add.bitmapText(0, -180, 'digital', 'LEADERBOARD', 32)
            .setOrigin(0.5)
            .setTint(0x00ffff);
        
        const players = [
            { name: 'Neo', score: 12500 },
            { name: 'Trinity', score: 11000 },
            { name: 'Morpheus', score: 9800 },
            { name: 'You', score: 7500 },
            { name: 'Cypher', score: 6000 }
        ];
        
        const playerTexts = players.map((player, i) => {
            return this.add.bitmapText(-150, -120 + i * 60, 'digital', 
                `${i+1}. ${player.name}: ${player.score}`, 24)
                .setOrigin(0, 0.5)
                .setTint(i === 3 ? 0x00ff00 : 0xffffff);
        });
        
        const closeBtn = this.add.bitmapText(0, 160, 'digital', 'CLOSE', 24)
            .setOrigin(0.5)
            .setTint(0xff0000)
            .setInteractive();
        
        leaderboard.add([bg, title, ...playerTexts, closeBtn]);
        
        closeBtn.on('pointerdown', () => {
            leaderboard.destroy();
        });
    }
    
    showShop() {
        // Заглушка для магазина
        const shop = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
        
        const bg = this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRoundedRect(-200, -200, 400, 400, 16);
        
        const title = this.add.bitmapText(0, -180, 'digital', 'HACKER SHOP', 32)
            .setOrigin(0.5)
            .setTint(0xff00ff);
        
        const items = [
            { name: 'TURBO BOOST', price: 10, icon: 'turbo' },
            { name: 'ENERGY SHIELD', price: 15, icon: 'shield' },
            { name: 'GLITCH SKIN', price: 25, icon: 'glitch' }
        ];
        
        const itemButtons = items.map((item, i) => {
            const itemBg = this.add.graphics()
                .fillStyle(0x111111, 1)
                .fillRoundedRect(-180, -100 + i * 80, 360, 70, 8);
            
            const icon = this.add.image(-120, -65 + i * 80, item.icon)
                .setScale(0.5);
            
            const text = this.add.bitmapText(-50, -65 + i * 80, 'digital', 
                `${item.name}\n${item.price} COINS`, 20)
                .setOrigin(0, 0.5);
            
            const btn = this.add.zone(-180, -100 + i * 80, 360, 70)
                .setInteractive();
            
            return [itemBg, icon, text, btn];
        }).flat();
        
        const closeBtn = this.add.bitmapText(0, 160, 'digital', 'CLOSE', 24)
            .setOrigin(0.5)
            .setTint(0xff0000)
            .setInteractive();
        
        shop.add([bg, title, ...itemButtons, closeBtn]);
        
        closeBtn.on('pointerdown', () => {
            shop.destroy();
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
        
        this.lanes = [0.3, 0.5, 0.7];
        this.currentLane = 1;
        this.speed = 5;
        this.score = 0;
        this.isGameOver = false;
        this.hasShield = false;
        this.isTurboActive = false;
        this.obstacles = [];
        this.bonuses = [];
    }

    init(data) {
        this.isPvPMode = data.isPvP || false;
    }

    create() {
        // Остановка музыки меню
        this.sound.stopAll();
        
        // Фон
        this.background = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background')
            .setOrigin(0)
            .setScrollFactor(0);
        
        // Дорожки
        this.roads = [];
        for (let i = 0; i < 3; i++) {
            const road = this.add.tileSprite(
                this.cameras.main.width * this.lanes[i], 
                this.cameras.main.height / 2, 
                100, 
                this.cameras.main.height, 
                'road'
            ).setOrigin(0.5, 0.5);
            road.setTint(0x333333);
            this.roads.push(road);
        }
        
        // Игрок
        this.player = this.physics.add.sprite(
            this.cameras.main.width * this.lanes[this.currentLane], 
            this.cameras.main.height * 0.8, 
            'player'
        );
        this.player.setCollideWorldBounds(true);
        this.player.setSize(40, 60);
        this.player.setOffset(12, 4);
        
        // Анимации игрока
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.player.play('run');
        
        // Группы объектов
        this.obstacles = this.physics.add.group();
        this.bonuses = this.physics.add.group();
        
        // Коллизии
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.bonuses, this.collectBonus, null, this);
        
        // Таймеры
        this.obstacleTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        
        this.bonusTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnBonus,
            callbackScope: this,
            loop: true
        });
        
        // Управление
        this.input.on('swipeleft', () => this.moveLeft());
        this.input.on('swiperight', () => this.moveRight());
        this.input.on('swipeup', () => this.jump());
        
        // Для тестирования на ПК
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Очки
        this.scoreText = this.add.bitmapText(20, 20, 'digital', `SCORE: ${this.score}`, 32)
            .setTint(0x00ff00);
        
        // Индикаторы бонусов
        this.shieldIcon = this.add.image(50, 80, 'shield')
            .setScale(0.5)
            .setVisible(false);
        
        this.turboIcon = this.add.image(100, 80, 'turbo')
            .setScale(0.5)
            .setVisible(false);
        
        // Звуки
        this.runSound = this.sound.add('run', { loop: true, volume: 0.3 });
        this.jumpSound = this.sound.add('jump', { volume: 0.5 });
        this.collectSound = this.sound.add('collect', { volume: 0.5 });
        this.crashSound = this.sound.add('crash', { volume: 0.5 });
        
        this.runSound.play();
        
        // Игровой цикл
        this.scoreEvent = this.time.addEvent({
            delay: 100,
            callback: this.updateScore,
            callbackScope: this,
            loop: true
        });
        
        // PvP режим
        if (this.isPvPMode) {
            this.initPvPMode();
        }
    }

    update() {
        if (this.isGameOver) return;
        
        // Прокрутка фона и дорожек
        this.background.tilePositionY -= this.speed;
        this.roads.forEach(road => road.tilePositionY -= this.speed);
        
        // Управление с клавиатуры для тестирования
        if (this.cursors.left.isDown) {
            this.moveLeft();
        } else if (this.cursors.right.isDown) {
            this.moveRight();
        } else if (this.cursors.up.isDown) {
            this.jump();
        }
        
        // Увеличение сложности
        if (this.score > 0 && this.score % 500 === 0) {
            this.speed = Math.min(15, 5 + Math.floor(this.score / 500));
        }
    }
    
    initPvPMode() {
  this.socket = new WebSocket(`ws://your-server-address:8080?playerId=${this.userId}&username=${encodeURIComponent(this.username)}`);

  this.socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'match_found':
        this.opponentId = data.opponent.id;
        this.opponentName = data.opponent.username;
        break;
      case 'opponent_update':
        this.opponentScore = data.score;
        this.opponentLane = data.lane;
        break;
      case 'game_start':
        this.isGameStarted = true;
        break;
      case 'opponent_left':
        this.handleOpponentDisconnected();
        break;
    }
  };

  // Отправка своих действий
  this.sendPlayerAction = (action) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'player_action',
        action
      }));
    }
  };
}
    
    moveLeft() {
        if (this.isGameOver) return;
        this.currentLane = Math.max(0, this.currentLane - 1);
        this.movePlayer();
    }
    
    moveRight() {
        if (this.isGameOver) return;
        this.currentLane = Math.min(2, this.currentLane + 1);
        this.movePlayer();
    }
    
    jump() {
        if (this.isGameOver || this.player.body.touching.down) {
            this.jumpSound.play();
            this.player.setVelocityY(-500);
        }
    }
    
    movePlayer() {
        this.tweens.add({
            targets: this.player,
            x: this.cameras.main.width * this.lanes[this.currentLane],
            duration: 200,
            ease: 'Power1'
        });
    }
    
    spawnObstacle() {
        if (this.isGameOver) return;
        
        const obstacleTypes = ['firewall', 'laser', 'glitch'];
        const type = Phaser.Math.RND.pick(obstacleTypes);
        const lane = Phaser.Math.RND.integerInRange(0, 2);
        
        const obstacle = this.physics.add.sprite(
            this.cameras.main.width * this.lanes[lane], 
            -50, 
            type
        );
        
        obstacle.setImmovable(true);
        obstacle.setSize(60, type === 'laser' ? 20 : 60);
        obstacle.setOffset(type === 'laser' ? 0 : 2, type === 'laser' ? 20 : 2);
        
        this.obstacles.add(obstacle);
        
        // Движение препятствий
        this.tweens.add({
            targets: obstacle,
            y: this.cameras.main.height + 50,
            duration: 3000 / this.speed * 5,
            onComplete: () => obstacle.destroy()
        });
    }
    
    spawnBonus() {
        if (this.isGameOver) return;
        
        const bonusTypes = ['data', 'shield', 'turbo'];
        const type = Phaser.Math.RND.pick(bonusTypes);
        const lane = Phaser.Math.RND.integerInRange(0, 2);
        
        const bonus = this.physics.add.sprite(
            this.cameras.main.width * this.lanes[lane], 
            -50, 
            type
        );
        
        bonus.setImmovable(true);
        this.bonuses.add(bonus);
        
        // Движение бонусов
        this.tweens.add({
            targets: bonus,
            y: this.cameras.main.height + 50,
            duration: 3000 / this.speed * 5,
            onComplete: () => bonus.destroy()
        });
    }
    
    hitObstacle(player, obstacle) {
        if (this.isTurboActive) {
            obstacle.destroy();
            return;
        }
        
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldIcon.setVisible(false);
            obstacle.destroy();
            
            // Эффект щита
            this.cameras.main.flash(200, 0, 0, 255);
            return;
        }
        
        this.crashSound.play();
        this.isGameOver = true;
        
        // Эффект глитча
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(200, 255, 0, 0);
        
        // Остановка таймеров
        this.obstacleTimer.destroy();
        this.bonusTimer.destroy();
        this.scoreEvent.destroy();
        
        // Отправка счета в Telegram
        this.sendScoreToTelegram();
        
        // Переход к экрану Game Over
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', { 
                score: this.score,
                isPvP: this.isPvPMode,
                isWinner: this.isPvPMode && this.score > this.opponentScore
            });
        });
    }
    
    collectBonus(player, bonus) {
        this.collectSound.play();
        
        switch (bonus.texture.key) {
            case 'data':
                this.score += 100;
                break;
                
            case 'shield':
                this.hasShield = true;
                this.shieldIcon.setVisible(true);
                break;
                
            case 'turbo':
                this.isTurboActive = true;
                this.turboIcon.setVisible(true);
                
                // Эффект турбо
                this.cameras.main.flash(100, 0, 255, 0);
                this.time.delayedCall(5000, () => {
                    this.isTurboActive = false;
                    this.turboIcon.setVisible(false);
                });
                break;
        }
        
        bonus.destroy();
    }
    
    updateScore() {
        this.score += 1;
        this.scoreText.setText(`SCORE: ${this.score}`);
    }
    
    sendScoreToTelegram() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
            const username = window.Telegram.WebApp.initDataUnsafe.user.username || 'Anonymous';
            
            // В реальном приложении здесь будет вызов Telegram Game API для сохранения счета
            console.log(`Score ${this.score} for user ${username} (${userId})`);
            
            if (window.Telegram.WebApp.sendData) {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    action: 'game_over',
                    score: this.score,
                    isPvP: this.isPvPMode,
                    userId: userId
                }));
            }
        }
    }
}

class PvPLobby extends Phaser.Scene {
    constructor() {
        super('PvPLobby');
    }
    
    create() {
        // Фон
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'cyber_city')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Текст ожидания
        this.add.bitmapText(this.cameras.main.centerX, 200, 'digital', 'WAITING FOR OPPONENT', 32)
            .setOrigin(0.5)
            .setTint(0x00ffff);
        
        // Анимация загрузки
        const dots = this.add.bitmapText(this.cameras.main.centerX, 250, 'digital', '', 32)
            .setOrigin(0.5)
            .setTint(0xffffff);
        
        this.time.addEvent({
            delay: 500,
            callback: () => {
                const text = dots.text;
                dots.setText(text.length < 3 ? text + '.' : '');
            },
            loop: true
        });
        
        // Кнопка отмены
        const cancelBtn = this.add.bitmapText(this.cameras.main.centerX, 400, 'digital', 'CANCEL', 32)
            .setOrigin(0.5)
            .setTint(0xff0000)
            .setInteractive();
        
        cancelBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // Заглушка для поиска противника
        this.time.delayedCall(3000, () => {
            this.scene.start('Game', { isPvP: true });
        });
    }
}

class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }
    
    init(data) {
        this.score = data.score;
        this.isPvP = data.isPvP || false;
        this.isWinner = data.isWinner || false;
    }
    
    create() {
        // Фон
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Текст Game Over
        const gameOverText = this.add.bitmapText(this.cameras.main.centerX, 200, 'digital', 
            this.isPvP ? (this.isWinner ? 'YOU WIN!' : 'YOU LOSE!') : 'GAME OVER', 64)
            .setOrigin(0.5)
            .setTint(this.isPvP ? (this.isWinner ? 0x00ff00 : 0xff0000) : 0xff0000);
        
        // Анимация текста
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Счет
        this.add.bitmapText(this.cameras.main.centerX, 300, 'digital', `YOUR SCORE: ${this.score}`, 32)
            .setOrigin(0.5)
            .setTint(0xffffff);
        
        // В PvP режиме показываем счет противника
        if (this.isPvP) {
            this.add.bitmapText(this.cameras.main.centerX, 350, 'digital', 
                `OPPONENT SCORE: ${Math.floor(this.score * (this.isWinner ? 0.8 : 1.2))}`, 32)
                .setOrigin(0.5)
                .setTint(0xff0000);
        }
        
        // Кнопка рестарта
        const restartButton = this.add.bitmapText(this.cameras.main.centerX, 450, 'digital', 
            this.isPvP ? 'PLAY AGAIN' : 'TRY AGAIN', 32)
            .setOrigin(0.5)
            .setTint(0x00ffff)
            .setInteractive();
        
        // Кнопка меню
        const menuButton = this.add.bitmapText(this.cameras.main.centerX, 500, 'digital', 'MAIN MENU', 32)
            .setOrigin(0.5)
            .setTint(0xff00ff)
            .setInteractive();
        
        // Обработчики кнопок
        restartButton.on('pointerdown', () => {
            this.scene.start('Game', { isPvP: this.isPvP });
        });
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // Звук победы/поражения
        if (this.isPvP) {
            if (this.isWinner) {
                this.sound.play('pvp_win');
            } else {
                this.sound.play('pvp_lose');
            }
        }
    }
}

// Запуск игры
new HackerRun();