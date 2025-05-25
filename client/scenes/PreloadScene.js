export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', {
      font: '20px monospace',
      fill: '#00ffcc'
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ffcc, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Загрузка ассетов
    this.load.image('player', 'assets/player.png');
    this.load.image('firewall', 'assets/firewall.png');
    this.load.image('bonus', 'assets/bonus.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
