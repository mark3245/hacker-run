export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.add.text(300, 100, 'HACKER RUN', { fontSize: '32px', fill: '#00ffcc' });

    this.add.text(350, 200, 'Играть', { fontSize: '24px', fill: '#ffffff' })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(330, 250, 'Лидеры', { fontSize: '24px', fill: '#ffffff' })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('LeaderboardScene'));

    this.add.text(350, 300, 'Магазин', { fontSize: '24px', fill: '#ffffff' })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('ShopScene'));
  }
}
