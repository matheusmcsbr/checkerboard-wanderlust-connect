
import { toast } from "@/components/ui/use-toast";
import { Player } from "./useGameState";

interface UseGameMovesProps {
  gameState: string;
  currentPlayer: Player;
  updateGameState: (newGameState: string) => void;
}

export const useGameMoves = ({
  gameState,
  currentPlayer,
  updateGameState
}: UseGameMovesProps) => {
  const handleMove = (from: number, to: number) => {
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
    
    if (isRegularMove) {
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
      updateGameState(newState.join(''));
      
      toast({
        title: "Piece Captured!",
        description: `${currentPlayer === 'white' ? 'White' : 'Purple'} captured a piece.`,
      });
      
      return;
    }
    
    toast({
      title: "Invalid Move",
      description: "You can only move diagonally by 1 square or capture by jumping 2 squares.",
      variant: "destructive"
    });
  };

  return { handleMove };
};
