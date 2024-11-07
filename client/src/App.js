import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DrawingCanvas from './components/DrawingCanvas';
import PlayerList from './components/PlayerList';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState({
    roomCode: null,
    playerName: '',
    isDrawing: false,
    players: [],
    currentWord: ''
  });

  const [error, setError] = useState('');

  const createRoom = () => {
    if (!gameState.playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    socket.emit('createRoom', gameState.playerName);
    setError('');
  };

  const joinRoom = () => {
    if (!gameState.playerName.trim() || !gameState.roomCode) {
      setError('Please enter your name and room code');
      return;
    }
    socket.emit('joinRoom', {
      roomCode: gameState.roomCode,
      playerName: gameState.playerName
    });
    setError('');
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
          <h1>Pinturillo Game</h1>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <input
              value={gameState.playerName}
              onChange={(e) => setGameState(prev => ({...prev, playerName: e.target.value}))}
              placeholder="Enter your name"
            />
            <button onClick={createRoom}>Create Room</button>
          </div>
          <div className="form-group">
            <input
              placeholder="Room Code"
              onChange={(e) => setGameState(prev => ({...prev, roomCode: e.target.value}))}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      ) : (
        <div className="game">
          <div className="game-header">
            <h2>Room Code: {gameState.roomCode}</h2>
            {gameState.currentWord && <h3>Word: {gameState.currentWord}</h3>}
          </div>
          <div className="game-content">
            <DrawingCanvas socket={socket} roomCode={gameState.roomCode} />
            <PlayerList players={gameState.players} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 