
import React from 'react';
import CheckerBoard from '../components/CheckerBoard';
import GameStatus from '../components/GameStatus';
import { GameInstructions } from '../components/GameInstructions';
import { useGameState } from '../hooks/useGameState';
import { useGameMoves } from '../hooks/useGameMoves';
import { getOpponentUrl } from '../utils/gameUrl';

const Game = () => {
  const { gameState, currentPlayer, controllingPlayer, gameId, updateGameState } = useGameState();
  const { handleMove } = useGameMoves({ gameState, currentPlayer, controllingPlayer, updateGameState });

  // Log the current game state to help debug
  React.useEffect(() => {
    console.log("Game component rendered with state:", {
      gameState: gameState.substring(0, 10) + "...", // Log first few characters to keep console clean
      currentPlayer,
      controllingPlayer,
      gameId
    });
  }, [gameState, currentPlayer, controllingPlayer, gameId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Checkers Game</h1>
      <GameStatus 
        currentPlayer={currentPlayer} 
        gameUrl={getOpponentUrl(gameState, currentPlayer, controllingPlayer, gameId)} 
        controllingPlayer={controllingPlayer || 'white'}
      />
      <CheckerBoard
        gameState={gameState}
        onMove={handleMove}
        currentPlayer={currentPlayer}
        controllingPlayer={controllingPlayer || 'white'}
      />
      <GameInstructions />
    </div>
  );
};

export default Game;
