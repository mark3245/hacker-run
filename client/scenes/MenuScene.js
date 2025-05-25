export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    this.add.text(centerX, 100, 'HACKER RUN', { fontSize: '32px', fill: '#00ffcc' }).setOrigin(0.5);

    this.add.text(centerX, 200, 'Играть', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(centerX, 250, 'Лидеры', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('LeaderboardScene'));

    this.add.text(centerX, 300, 'Магазин', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('ShopScene'));

    if (window.Telegram?.WebApp) {
      this.add.text(centerX, 400, 'Выход', { fontSize: '24px', fill: '#ff4444' }).setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          Telegram.WebApp.close();
        });
    }
  }
}
