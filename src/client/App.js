import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DrawingCanvas from './components/DrawingCanvas';
import PlayerList from './components/PlayerList';

const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState({
    roomCode: null,
    playerName: '',
    isDrawing: false,
    players: [],
    currentWord: ''
  });

  const createRoom = () => {
    socket.emit('createRoom', gameState.playerName);
  };

  const joinRoom = () => {
    socket.emit('joinRoom', {
      roomCode: gameState.roomCode,
      playerName: gameState.playerName
    });
  };

  useEffect(() => {
    socket.on('roomCreated', (roomCode) => {
      setGameState(prev => ({...prev, roomCode}));
    });

    socket.on('playerJoined', (players) => {
      setGameState(prev => ({...prev, players}));
    });

    socket.on('correctGuess', ({player, scores}) => {
      setGameState(prev => ({...prev, players: scores}));
    });

    return () => {
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('correctGuess');
    };
  }, []);

  return (
    <div className="app">
      {!gameState.roomCode ? (
        <div className="lobby">
          <input
            value={gameState.playerName}
            onChange={(e) => setGameState(prev => ({...prev, playerName: e.target.value}))}
            placeholder="Enter your name"
          />
          <button onClick={createRoom}>Create Room</button>
          <input
            placeholder="Room Code"
            onChange={(e) => setGameState(prev => ({...prev, roomCode: e.target.value}))}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="game">
          <DrawingCanvas socket={socket} roomCode={gameState.roomCode} />
          <PlayerList players={gameState.players} />
        </div>
      )}
    </div>
  );
}

export default App; 