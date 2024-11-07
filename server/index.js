const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms
const rooms = new Map();
const words = ['dog', 'cat', 'house', 'tree', 'sun']; // Basic word list for MVP

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle room creation
  socket.on('createRoom', (playerName) => {
    console.log('Creating room for player:', playerName);
    const roomCode = Math.random().toString(36).substring(2, 8);
    const initialPlayers = [{id: socket.id, name: playerName, score: 0}];
    rooms.set(roomCode, {
      players: initialPlayers,
      currentDrawer: null,
      word: null,
      status: 'waiting'
    });
    socket.join(roomCode);
    console.log('Room created:', roomCode);
    socket.emit('roomCreated', roomCode);
    socket.emit('playerJoined', initialPlayers);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle joining rooms
  socket.on('joinRoom', ({roomCode, playerName}) => {
    console.log('Player attempting to join room:', roomCode);
    if (rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      const newPlayer = {id: socket.id, name: playerName, score: 0};
      room.players.push(newPlayer);
      socket.join(roomCode);
      console.log('Players in room:', room.players);
      // Emit to everyone in the room, including the joiner
      io.to(roomCode).emit('playerJoined', room.players);
    } else {
      socket.emit('joinError', 'Room not found');
    }
  });

  // Handle drawing
  socket.on('draw', ({roomCode, drawData}) => {
    socket.to(roomCode).emit('drawing', drawData);
  });

  // Handle guessing
  socket.on('guess', ({roomCode, word}) => {
    const room = rooms.get(roomCode);
    if (room && room.word === word.toLowerCase()) {
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