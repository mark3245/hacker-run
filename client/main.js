import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js';
import ShopScene from './scenes/ShopScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [PreloadScene, MenuScene, GameScene, UIScene, LeaderboardScene, ShopScene],
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);