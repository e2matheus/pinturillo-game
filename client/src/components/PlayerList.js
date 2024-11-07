import React from 'react';

function PlayerList({ players }) {
  return (
    <div className="player-list">
      <h3>Players</h3>
      <ul>
        {players.map((player, index) => (
          <li key={player.id}>
            {player.name} - Score: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList; 