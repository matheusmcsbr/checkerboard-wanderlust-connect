import { toast } from "@/components/ui/use-toast";
import { Player } from "./useGameState";
import { useState } from "react";

interface UseGameMovesProps {
  gameState: string;
  currentPlayer: Player;
  updateGameState: (newGameState: string, continueTurn?: boolean) => void;
}

export const useGameMoves = ({
  gameState,
  currentPlayer,
  updateGameState
}: UseGameMovesProps) => {
  const [multipleCapturePiecePosition, setMultipleCapturePiecePosition] = useState<number | null>(null);

  // Helper function to check if more captures are possible
  const canCaptureMore = (position: number, state: string, player: Player): boolean => {
    const row = Math.floor(position / 8);
    const col = position % 8;
    const isWhite = player === 'white';
    const opponentPiece = isWhite ? 'p' : 'w';
    
    // Direction modifiers for checking diagonal positions
    // White pieces go up (negative rows), purple pieces go down (positive rows)
    const directions = [
      { rowMod: isWhite ? -2 : 2, colMod: -2 },
      { rowMod: isWhite ? -2 : 2, colMod: 2 },
    ];
    
    for (const { rowMod, colMod } of directions) {
      const newRow = row + rowMod;
      const newCol = col + colMod;
      const capturedRow = row + (rowMod > 0 ? 1 : -1);
      const capturedCol = col + (colMod > 0 ? 1 : -1);
      
      // Check if the new position is on the board
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const capturedPos = capturedRow * 8 + capturedCol;
        const newPos = newRow * 8 + newCol;
        
        // Check if there's an opponent's piece to capture and the landing square is empty
        if (state[capturedPos] === opponentPiece && state[newPos] === '.') {
          return true;
        }
      }
    }
    
    return false;
  };

  const handleMove = (from: number, to: number) => {
    // If we're in a multiple capture sequence, only the piece that made the first capture can move
    if (multipleCapturePiecePosition !== null && from !== multipleCapturePiecePosition) {
      toast({
        title: "Invalid Move",
        description: "You must continue capturing with the same piece.",
        variant: "destructive"
      });
      return;
    }
    
    const fromRow = Math.floor(from / 8);
    const fromCol = from % 8;
    const toRow = Math.floor(to / 8);
    const toCol = to % 8;
    
    const currentPiece = gameState[from];
    const isWhite = currentPiece === 'w';
    const isPurple = currentPiece === 'p';
    const targetSquare = gameState[to];
    
    // Check if piece belongs to current player
    if ((isWhite && currentPlayer !== 'white') || (isPurple && currentPlayer !== 'purple')) {
      toast({
        title: "Not Your Turn",
        description: `It's ${currentPlayer}'s turn. You can only move ${currentPlayer} pieces.`,
        variant: "destructive"
      });
      return;
    }
    
    if (targetSquare !== '.') {
      toast({
        title: "Invalid Move",
        description: "You can only move to empty squares.",
        variant: "destructive"
      });
      return;
    }

    const isRegularMove = Math.abs(fromRow - toRow) === 1 && 
                         Math.abs(fromCol - toCol) === 1;
    
    const isCaptureMove = Math.abs(fromRow - toRow) === 2 && 
                         Math.abs(fromCol - toCol) === 2;
    
    // If we're in a multiple capture sequence, only capture moves are allowed
    if (multipleCapturePiecePosition !== null && !isCaptureMove) {
      toast({
        title: "Invalid Move",
        description: "You must continue capturing when possible.",
        variant: "destructive"
      });
      return;
    }
    
    if (isRegularMove) {
      // Regular moves are not allowed if there's a capture available
      if (multipleCapturePiecePosition !== null) {
        toast({
          title: "Invalid Move",
          description: "You must continue capturing when possible.",
          variant: "destructive"
        });
        return;
      }
      
      if (isWhite && toRow >= fromRow) {
        toast({
          title: "Invalid Move",
          description: "White pieces can only move upward.",
          variant: "destructive"
        });
        return;
      }
      
      if (isPurple && toRow <= fromRow) {
        toast({
          title: "Invalid Move",
          description: "Purple pieces can only move downward.",
          variant: "destructive"
        });
        return;
      }
      
      const newState = gameState.split('');
      newState[to] = newState[from];
      newState[from] = '.';
      updateGameState(newState.join(''));
      setMultipleCapturePiecePosition(null); // Clear any multiple capture state
      return;
    }
    
    if (isCaptureMove) {
      const capturedRow = fromRow + (toRow > fromRow ? 1 : -1);
      const capturedCol = fromCol + (toCol > fromCol ? 1 : -1);
      const capturedPos = capturedRow * 8 + capturedCol;
      
      const capturedPiece = gameState[capturedPos];
      
      if (isWhite && capturedPiece !== 'p') {
        toast({
          title: "Invalid Capture",
          description: "White pieces can only capture purple pieces.",
          variant: "destructive"
        });
        return;
      }
      
      if (isPurple && capturedPiece !== 'w') {
        toast({
          title: "Invalid Capture",
          description: "Purple pieces can only capture white pieces.",
          variant: "destructive"
        });
        return;
      }
      
      if (isWhite && toRow >= fromRow) {
        toast({
          title: "Invalid Move",
          description: "White pieces can only move upward.",
          variant: "destructive"
        });
        return;
      }
      
      if (isPurple && toRow <= fromRow) {
        toast({
          title: "Invalid Move",
          description: "Purple pieces can only move downward.",
          variant: "destructive"
        });
        return;
      }
      
      const newState = gameState.split('');
      newState[to] = newState[from];
      newState[from] = '.';
      newState[capturedPos] = '.';
      
      // Check if more captures are possible after this move
      const moreCaptures = canCaptureMore(to, newState.join(''), currentPlayer);
      
      if (moreCaptures) {
        // Update game state but don't change player turn
        const updatedState = newState.join('');
        updateGameState(updatedState, true); // Pass true to indicate continuing the same turn
        setMultipleCapturePiecePosition(to); // Remember which piece must continue capturing
        
        toast({
          title: "Multiple Capture!",
          description: "You must continue capturing with the same piece.",
        });
      } else {
        // Regular end of turn
        updateGameState(newState.join(''));
        setMultipleCapturePiecePosition(null); // Clear the multiple capture state
        
        toast({
          title: "Piece Captured!",
          description: `${currentPlayer === 'white' ? 'White' : 'Purple'} captured a piece.`,
        });
      }
      
      return;
    }
    
    toast({
      title: "Invalid Move",
      description: "You can only move diagonally by 1 square or capture by jumping 2 squares.",
      variant: "destructive"
    });
  };

  return { handleMove, multipleCapturePiecePosition };
};
