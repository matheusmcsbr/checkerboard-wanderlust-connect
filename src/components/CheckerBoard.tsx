
import React from 'react';
import { toast } from "@/components/ui/use-toast";

interface CheckerBoardProps {
  gameState: string;
  onMove: (from: number, to: number) => void;
  currentPlayer: 'white' | 'purple';
}

const CheckerBoard: React.FC<CheckerBoardProps> = ({ gameState, onMove, currentPlayer }) => {
  const [selectedPiece, setSelectedPiece] = React.useState<number | null>(null);
  const [validMoves, setValidMoves] = React.useState<number[]>([]);
  
  // Calculate valid moves for the selected piece
  React.useEffect(() => {
    if (selectedPiece === null) {
      setValidMoves([]);
      return;
    }
    
    const piece = gameState[selectedPiece];
    const row = Math.floor(selectedPiece / 8);
    const col = selectedPiece % 8;
    const possibleMoves: number[] = [];
    
    // Helper function to check if a position is on the board
    const isOnBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
    
    // Helper function to get piece at position
    const getPiece = (r: number, c: number) => {
      if (!isOnBoard(r, c)) return null;
      return gameState[r * 8 + c];
    };
    
    // For white pieces (moving upward)
    if (piece === 'w') {
      // Check regular moves (diagonally up)
      if (isOnBoard(row - 1, col - 1) && getPiece(row - 1, col - 1) === '.') {
        possibleMoves.push((row - 1) * 8 + (col - 1));
      }
      if (isOnBoard(row - 1, col + 1) && getPiece(row - 1, col + 1) === '.') {
        possibleMoves.push((row - 1) * 8 + (col + 1));
      }
      
      // Check capture moves
      if (isOnBoard(row - 1, col - 1) && getPiece(row - 1, col - 1) === 'p' && 
          isOnBoard(row - 2, col - 2) && getPiece(row - 2, col - 2) === '.') {
        possibleMoves.push((row - 2) * 8 + (col - 2));
      }
      if (isOnBoard(row - 1, col + 1) && getPiece(row - 1, col + 1) === 'p' && 
          isOnBoard(row - 2, col + 2) && getPiece(row - 2, col + 2) === '.') {
        possibleMoves.push((row - 2) * 8 + (col + 2));
      }
    }
    
    // For purple pieces (moving downward)
    if (piece === 'p') {
      // Check regular moves (diagonally down)
      if (isOnBoard(row + 1, col - 1) && getPiece(row + 1, col - 1) === '.') {
        possibleMoves.push((row + 1) * 8 + (col - 1));
      }
      if (isOnBoard(row + 1, col + 1) && getPiece(row + 1, col + 1) === '.') {
        possibleMoves.push((row + 1) * 8 + (col + 1));
      }
      
      // Check capture moves
      if (isOnBoard(row + 1, col - 1) && getPiece(row + 1, col - 1) === 'w' && 
          isOnBoard(row + 2, col - 2) && getPiece(row + 2, col - 2) === '.') {
        possibleMoves.push((row + 2) * 8 + (col - 2));
      }
      if (isOnBoard(row + 1, col + 1) && getPiece(row + 1, col + 1) === 'w' && 
          isOnBoard(row + 2, col + 2) && getPiece(row + 2, col + 2) === '.') {
        possibleMoves.push((row + 2) * 8 + (col + 2));
      }
    }
    
    setValidMoves(possibleMoves);
  }, [selectedPiece, gameState]);
  
  const renderSquare = (position: number) => {
    const row = Math.floor(position / 8);
    const col = position % 8;
    const isDark = (row + col) % 2 === 1;
    const piece = gameState[position];
    
    const isSelectedPiece = selectedPiece === position;
    const isValidMove = validMoves.includes(position);
    
    const handleClick = () => {
      if (selectedPiece === null) {
        // Selecting a piece
        if (piece !== '.') {
          if ((currentPlayer === 'white' && piece === 'w') ||
              (currentPlayer === 'purple' && piece === 'p')) {
            setSelectedPiece(position);
          } else {
            toast({
              title: "Wrong Turn",
              description: `It's ${currentPlayer}'s turn to move.`,
              variant: "destructive"
            });
          }
        }
      } else if (position === selectedPiece) {
        // Deselect the piece
        setSelectedPiece(null);
      } else {
        // Attempt to move to this position
        if (isValidMove) {
          onMove(selectedPiece, position);
          setSelectedPiece(null);
        } else if (piece !== '.') {
          // Clicked on another piece
          if ((currentPlayer === 'white' && piece === 'w') ||
              (currentPlayer === 'purple' && piece === 'p')) {
            setSelectedPiece(position);
          } else {
            toast({
              title: "Invalid Move",
              description: "You cannot move to an occupied square.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Invalid Move",
            description: "This move is not allowed.",
            variant: "destructive"
          });
        }
      }
    };

    return (
      <div
        key={position}
        onClick={handleClick}
        className={`w-12 h-12 flex items-center justify-center transition-all duration-200
          ${isDark ? 'bg-[#1A1F2C]' : 'bg-[#F1F0FB]'}
          ${isSelectedPiece ? 'ring-2 ring-blue-500' : ''}
          ${isValidMove ? 'ring-2 ring-green-500 cursor-pointer' : ''}
          ${isValidMove && !isSelectedPiece ? 'bg-green-100' : ''}`}
      >
        {piece !== '.' && (
          <div className={`w-8 h-8 rounded-full shadow-lg transition-transform
            ${piece === 'w' ? 'bg-white border-2 border-gray-200' : 'bg-[#8B5CF6]'}
            ${isSelectedPiece ? 'transform scale-110' : ''}`}
          />
        )}
        {isValidMove && piece === '.' && (
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
        )}
      </div>
    );
  };

  return (
    <div className="inline-block p-4 bg-white rounded-lg shadow-xl">
      <div className="grid grid-cols-8 gap-0 border-2 border-gray-300">
        {Array(64).fill(null).map((_, i) => renderSquare(i))}
      </div>
    </div>
  );
};

export default CheckerBoard;
