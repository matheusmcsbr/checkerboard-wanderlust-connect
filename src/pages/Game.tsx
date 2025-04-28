
import React from 'react';
import CheckerBoard from '../components/CheckerBoard';
import GameStatus from '../components/GameStatus';
import { useGameState } from '../hooks/useGameState';
import { useGameMoves } from '../hooks/useGameMoves';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Game = () => {
  const { gameState, currentPlayer, gameId, updateGameState } = useGameState();
  const { handleMove } = useGameMoves({ gameState, currentPlayer, updateGameState });

  const handleReset = () => {
    const initialState = 'p.p.p.p..p.p.p.pp.p.p.p...............w.w.w.w.w.w.w.w..w.w.w.w';
    updateGameState(initialState);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Checkers Game</h1>
      
      <div className="flex items-center gap-4 mb-8">
        <GameStatus currentPlayer={currentPlayer} />
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Reset Game
        </Button>
      </div>
      
      <CheckerBoard
        gameState={gameState}
        onMove={handleMove}
        currentPlayer={currentPlayer}
      />
    </div>
  );
};

export default Game;
