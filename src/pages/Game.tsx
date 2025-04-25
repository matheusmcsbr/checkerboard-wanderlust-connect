
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckerBoard from '../components/CheckerBoard';
import GameStatus from '../components/GameStatus';
import { toast } from "@/components/ui/use-toast";

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
  }, [location.search]);

  const handleMove = (from: number, to: number) => {
    // Get positions
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    // Get current piece
    const currentPiece = gameState[from];
    const isWhite = currentPiece === 'w';
    const isPurple = currentPiece === 'p';
    const targetSquare = gameState[to];
    
    // Ensure the destination is empty
    if (targetSquare !== '.') {
      toast({
        title: "Invalid Move",
        description: "You can only move to empty squares.",
        variant: "destructive"
      });
      return;
    }

    // Check if it's a regular move (1 square diagonally)
    const isRegularMove = Math.abs(fromRow - toRow) === 1 && 
                         Math.abs(fromCol - toCol) === 1;
    
    // Check if it's a capture move (2 squares diagonally)
    const isCaptureMove = Math.abs(fromRow - toRow) === 2 && 
                         Math.abs(fromCol - toCol) === 2;
    
    // Handle regular move
    if (isRegularMove) {
      // White pieces can only move up (decreasing row)
      if (isWhite && toRow >= fromRow) {
        toast({
          title: "Invalid Move",
          description: "White pieces can only move upward.",
          variant: "destructive"
        });
        return;
      }
      
      // Purple pieces can only move down (increasing row)
      if (isPurple && toRow <= fromRow) {
        toast({
          title: "Invalid Move",
          description: "Purple pieces can only move downward.",
          variant: "destructive"
        });
        return;
      }
      
      // Perform the regular move
      const newState = gameState.split('');
      newState[to] = newState[from];
      newState[from] = '.';
      updateGameState(newState.join(''));
      return;
    }
    
    // Handle capture move
    if (isCaptureMove) {
      // Calculate the position of the captured piece
      const capturedRow = fromRow + (toRow > fromRow ? 1 : -1);
      const capturedCol = fromCol + (toCol > fromCol ? 1 : -1);
      const capturedPos = capturedRow * 8 + capturedCol;
      
      // Get the captured piece
      const capturedPiece = gameState[capturedPos];
      
      // White can only capture purple pieces
      if (isWhite && capturedPiece !== 'p') {
        toast({
          title: "Invalid Capture",
          description: "White pieces can only capture purple pieces.",
          variant: "destructive"
        });
        return;
      }
      
      // Purple can only capture white pieces
      if (isPurple && capturedPiece !== 'w') {
        toast({
          title: "Invalid Capture",
          description: "Purple pieces can only capture white pieces.",
          variant: "destructive"
        });
        return;
      }
      
      // White pieces can only move up (decreasing row)
      if (isWhite && toRow >= fromRow) {
        toast({
          title: "Invalid Move",
          description: "White pieces can only move upward.",
          variant: "destructive"
        });
        return;
      }
      
      // Purple pieces can only move down (increasing row)
      if (isPurple && toRow <= fromRow) {
        toast({
          title: "Invalid Move",
          description: "Purple pieces can only move downward.",
          variant: "destructive"
        });
        return;
      }
      
      // Perform the capture move
      const newState = gameState.split('');
      newState[to] = newState[from];
      newState[from] = '.';
      newState[capturedPos] = '.';
      updateGameState(newState.join(''));
      
      toast({
        title: "Piece Captured!",
        description: `${currentPlayer === 'white' ? 'White' : 'Purple'} captured a piece.`,
      });
      
      return;
    }
    
    // If we got here, the move is not valid
    toast({
      title: "Invalid Move",
      description: "You can only move diagonally by 1 square or capture by jumping 2 squares.",
      variant: "destructive"
    });
  };
  
  const updateGameState = (newGameState: string) => {
    setGameState(newGameState);
    setCurrentPlayer(currentPlayer === 'white' ? 'purple' : 'white');
    
    // Update URL with new game state
    const params = new URLSearchParams();
    params.set('state', newGameState);
    params.set('player', currentPlayer === 'white' ? 'purple' : 'white');
    navigate(`?${params.toString()}`, { replace: true });
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
      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold mb-1">How to play:</h3>
        <ul className="list-disc pl-5">
          <li>Click on your piece to select it</li>
          <li>Click on an empty square to move diagonally</li>
          <li>Capture opponent pieces by jumping over them diagonally</li>
          <li>White moves upward, Purple moves downward</li>
          <li>Share the URL for others to join your game</li>
        </ul>
      </div>
    </div>
  );
};

export default Game;
