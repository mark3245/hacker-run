import { getHighScores } from '../telegram/api.js';

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  async create() {
    const scores = await getHighScores();
    // Отображение списка лидеров
  }
}
