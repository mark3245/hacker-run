export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('firewall', 'assets/firewall.png');
    this.load.image('bonus', 'assets/bonus.png');
    // Загрузка других ресурсов
  }

  create() {
    this.scene.start('MenuScene');
  }
}
