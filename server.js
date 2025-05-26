const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Создаем HTTP сервер для health check
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hacker Run PvP Server');
});

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ server });

// Состояние сервера
const rooms = new Map(); // roomId -> { players: [player1, player2], gameState: {} }
const playerToRoom = new Map(); // playerId -> roomId
const waitingPlayers = new Set();

// Обработка подключений
wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);
  const playerId = query.playerId;
  const username = query.username || 'Anonymous';
  
  console.log(`Player connected: ${playerId} (${username})`);

  // Обработка сообщений от клиента
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, playerId, data);
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  // Обработка отключения
  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    handleDisconnect(playerId);
  });

  // Отправляем подтверждение подключения
  ws.send(JSON.stringify({
    type: 'connection_ack',
    playerId,
    timestamp: Date.now()
  }));
});

function handleMessage(ws, playerId, data) {
  switch (data.type) {
    case 'find_match':
      handleFindMatch(ws, playerId, data);
      break;
    case 'game_update':
      handleGameUpdate(playerId, data);
      break;
    case 'player_action':
      handlePlayerAction(playerId, data);
      break;
    case 'leave_room':
      handleLeaveRoom(playerId);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

function handleFindMatch(ws, playerId, data) {
  // Удаляем игрока из всех комнат, если он уже где-то есть
  handleLeaveRoom(playerId);

  // Ищем свободного соперника
  if (waitingPlayers.size > 0) {
    const opponentId = waitingPlayers.values().next().value;
    waitingPlayers.delete(opponentId);
    
    // Создаем комнату
    const roomId = generateRoomId();
    const room = {
      id: roomId,
      players: [
        { id: opponentId, ws: getWebSocket(opponentId), lane: 1, score: 0, ready: false },
        { id: playerId, ws: ws, lane: 1, score: 0, ready: false }
      ],
      gameState: 'waiting'
    };
    
    rooms.set(roomId, room);
    playerToRoom.set(opponentId, roomId);
    playerToRoom.set(playerId, roomId);
    
    // Уведомляем игроков
    room.players.forEach(player => {
      player.ws.send(JSON.stringify({
        type: 'match_found',
        roomId,
        opponent: {
          id: player.id === opponentId ? playerId : opponentId,
          username: player.id === opponentId ? data.username : 'Opponent'
        },
        timestamp: Date.now()
      }));
    });
    
    console.log(`Room created: ${roomId} with ${playerId} and ${opponentId}`);
  } else {
    // Добавляем в очередь ожидания
    waitingPlayers.add(playerId);
    playerToRoom.set(playerId, 'waiting');
    
    ws.send(JSON.stringify({
      type: 'waiting_for_opponent',
      timestamp: Date.now()
    }));
    
    console.log(`Player ${playerId} waiting for opponent`);
  }
}

function handleGameUpdate(playerId, data) {
  const roomId = playerToRoom.get(playerId);
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const player = room.players.find(p => p.id === playerId);
  const opponent = room.players.find(p => p.id !== playerId);

  if (!player || !opponent) return;

  // Обновляем состояние игрока
  player.score = data.score || player.score;
  player.lane = data.lane || player.lane;
  player.ready = data.ready || player.ready;

  // Отправляем обновление противнику
  opponent.ws.send(JSON.stringify({
    type: 'opponent_update',
    score: player.score,
    lane: player.lane,
    timestamp: Date.now()
  }));

  // Если оба игрока готовы, начинаем игру
  if (room.gameState === 'waiting' && room.players.every(p => p.ready)) {
    room.gameState = 'playing';
    
    room.players.forEach(player => {
      player.ws.send(JSON.stringify({
        type: 'game_start',
        timestamp: Date.now()
      }));
    });
    
    console.log(`Game started in room ${roomId}`);
  }
}

function handlePlayerAction(playerId, data) {
  const roomId = playerToRoom.get(playerId);
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const opponent = room.players.find(p => p.id !== playerId);

  if (!opponent) return;

  // Пересылаем действие противнику
  opponent.ws.send(JSON.stringify({
    type: 'opponent_action',
    action: data.action,
    timestamp: Date.now()
  }));
}

function handleDisconnect(playerId) {
  handleLeaveRoom(playerId);
  waitingPlayers.delete(playerId);
}

function handleLeaveRoom(playerId) {
  const roomId = playerToRoom.get(playerId);
  if (!roomId || !rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const opponent = room.players.find(p => p.id !== playerId);

  if (opponent) {
    opponent.ws.send(JSON.stringify({
      type: 'opponent_left',
      timestamp: Date.now()
    }));
    
    // Перемещаем оставшегося игрока в очередь
    waitingPlayers.add(opponent.id);
    playerToRoom.set(opponent.id, 'waiting');
  }

  rooms.delete(roomId);
  playerToRoom.delete(playerId);
  console.log(`Room ${roomId} disbanded`);
}

function getWebSocket(playerId) {
  let targetWs = null;
  wss.clients.forEach(ws => {
    const { query } = url.parse(ws.upgradeReq.url, true);
    if (query.playerId === playerId) {
      targetWs = ws;
    }
  });
  return targetWs;
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Запуск сервера
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Очистка неактивных комнат
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    if (room.gameState === 'waiting' && now - room.createdAt > 300000) { // 5 минут
      room.players.forEach(player => {
        player.ws.send(JSON.stringify({
          type: 'match_timeout',
          timestamp: now
        }));
        playerToRoom.delete(player.id);
      });
      rooms.delete(roomId);
      console.log(`Room ${roomId} cleaned up due to inactivity`);
    }
  });
}, 60000); // Проверка каждую минуту
