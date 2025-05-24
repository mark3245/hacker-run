export async function sendScore(score) {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify({ score }));
  } else {
    console.log("Score sent (debug):", score);
  }
}

export async function getHighScores() {
  // Здесь можно заменить на запрос к серверу
  return [
    { name: 'Player1', score: 1000 },
    { name: 'Player2', score: 850 },
    { name: 'Player3', score: 700 }
  ];
}