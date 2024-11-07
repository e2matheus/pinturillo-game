const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = new Map();
const words = ['dog', 'cat', 'house', 'tree', 'sun']; // Basic word list for MVP

io.on('connection', (socket) => {
  socket.on('createRoom', (playerName) => {
    const roomCode = Math.random().toString(36).substring(2, 8);
    rooms.set(roomCode, {
      players: [{id: socket.id, name: playerName, score: 0}],
      currentDrawer: null,
      word: null,
      status: 'waiting'
    });
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
  });

  socket.on('joinRoom', ({roomCode, playerName}) => {
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      room.players.push({id: socket.id, name: playerName, score: 0});
      socket.join(roomCode);
      io.to(roomCode).emit('playerJoined', room.players);
    }
  });

  socket.on('draw', ({roomCode, drawData}) => {
    socket.to(roomCode).emit('drawing', drawData);
  });

  socket.on('guess', ({roomCode, word}) => {
    const room = rooms.get(roomCode);
    if (room && room.word === word.toLowerCase()) {
      // Handle correct guess
      const player = room.players.find(p => p.id === socket.id);
      player.score += 10;
      io.to(roomCode).emit('correctGuess', {
        player: player.name,
        scores: room.players
      });
    }
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
}); 