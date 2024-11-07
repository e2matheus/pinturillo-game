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

server.listen(3001, () => {
  console.log('Server running on port 3001');
}); 