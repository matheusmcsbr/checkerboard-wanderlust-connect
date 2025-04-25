
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckerBoard from '../components/CheckerBoard';
import GameStatus from '../components/GameStatus';

const INITIAL_BOARD = 'p.p.p.p.'
                   + '.p.p.p.p'
                   + 'p.p.p.p.'
                   + '........'
                   + '........'
                   + '.w.w.w.w'
                   + 'w.w.w.w.'
                   + '.w.w.w.w';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'purple'>('white');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = params.get('state');
    const player = params.get('player');
    
    if (state && state.length === 64 && /^[pw.]{64}$/.test(state)) {
      setGameState(state);
    }
    
    if (player === 'white' || player === 'purple') {
      setCurrentPlayer(player);
    }
  }, [location]);

  const handleMove = (from: number, to: number) => {
    // Basic move validation (only diagonal moves)
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const isValidMove = Math.abs(fromRow - toRow) === 1 && 
                       Math.abs(fromCol - toCol) === 1 &&
                       gameState[to] === '.';

    if (!isValidMove) return;

    const newState = gameState.split('');
    newState[to] = newState[from];
    newState[from] = '.';
    const newGameState = newState.join('');
    
    setGameState(newGameState);
    setCurrentPlayer(currentPlayer === 'white' ? 'purple' : 'white');
    
    // Update URL with new game state
    const params = new URLSearchParams();
    params.set('state', newGameState);
    params.set('player', currentPlayer === 'white' ? 'purple' : 'white');
    navigate(`?${params.toString()}`);
  };

  const gameUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Checkers Game</h1>
      <GameStatus currentPlayer={currentPlayer} gameUrl={gameUrl} />
      <CheckerBoard
        gameState={gameState}
        onMove={handleMove}
        currentPlayer={currentPlayer}
      />
    </div>
  );
};

export default Game;
