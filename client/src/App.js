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
    currentWord: '',
    currentDrawer: '',
    isMyTurn: false,
    isLoading: false
  });

  const [inputRoomCode, setInputRoomCode] = useState('');
  const [error, setError] = useState('');

  const createRoom = () => {
    if (!gameState.playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    console.log('Attempting to create room for:', gameState.playerName);
    socket.emit('createRoom', gameState.playerName);
    setError('');
  };

  const joinRoom = () => {
    if (!gameState.playerName.trim() || !inputRoomCode) {
      setError('Please enter your name and room code');
      return;
    }
    socket.emit('joinRoom', {
      roomCode: inputRoomCode,
      playerName: gameState.playerName
    });
    setError('');
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('roomCreated', (roomCode) => {
      console.log('Room created:', roomCode);
      setGameState(prev => ({
        ...prev,
        roomCode,
        players: []
      }));
    });

    socket.on('playerJoined', (players) => {
      console.log('Players updated:', players);
      setGameState(prev => ({
        ...prev,
        players,
        roomCode: prev.roomCode || inputRoomCode,
        isLoading: true
      }));
    });

    socket.on('joinError', (message) => {
      setError(message);
    });

    socket.on('correctGuess', ({player, scores}) => {
      setGameState(prev => ({...prev, players: scores}));
    });

    socket.on('roundStart', ({drawer, word}) => {
      setGameState(prev => ({
        ...prev,
        currentWord: word,
        currentDrawer: drawer,
        isMyTurn: drawer === prev.playerName,
        isLoading: false
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('correctGuess');
      socket.off('joinError');
      socket.off('roundStart');
    };
  }, [inputRoomCode]);

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
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      ) : (
        <div className="game">
          <div className="game-header">
            <h2>Room Code: {gameState.roomCode}</h2>
            {gameState.currentWord && (
              <div className="word-display">
                <h3>Word: {gameState.currentWord}</h3>
                {gameState.isMyTurn && <div className="drawer-alert">You are the drawer!</div>}
              </div>
            )}
          </div>
          <div className="game-content">
            <DrawingCanvas 
              socket={socket} 
              roomCode={gameState.roomCode} 
              isMyTurn={gameState.isMyTurn}
              currentDrawer={gameState.currentDrawer}
              isLoading={gameState.isLoading}
            />
            <PlayerList players={gameState.players} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 