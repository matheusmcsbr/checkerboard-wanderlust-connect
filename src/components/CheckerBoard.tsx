
import React from 'react';
import { Square } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CheckerBoardProps {
  gameState: string;
  onMove: (from: number, to: number) => void;
  currentPlayer: 'white' | 'purple';
}

const CheckerBoard: React.FC<CheckerBoardProps> = ({ gameState, onMove, currentPlayer }) => {
  const [selectedPiece, setSelectedPiece] = React.useState<number | null>(null);
  
  const renderSquare = (position: number) => {
    const row = Math.floor(position / 8);
    const col = position % 8;
    const isDark = (row + col) % 2 === 1;
    const piece = gameState[position];
    
    const isValidMove = selectedPiece !== null && 
      ((currentPlayer === 'white' && gameState[selectedPiece] === 'w') ||
       (currentPlayer === 'purple' && gameState[selectedPiece] === 'p'));

    const handleClick = () => {
      if (selectedPiece === null && piece !== '.') {
        if ((currentPlayer === 'white' && piece === 'w') ||
            (currentPlayer === 'purple' && piece === 'p')) {
          setSelectedPiece(position);
        }
      } else if (selectedPiece !== null) {
        if (position !== selectedPiece) {
          onMove(selectedPiece, position);
        }
        setSelectedPiece(null);
      }
    };

    return (
      <div
        key={position}
        onClick={handleClick}
        className={`w-12 h-12 flex items-center justify-center transition-all duration-200
          ${isDark ? 'bg-[#1A1F2C]' : 'bg-[#F1F0FB]'}
          ${selectedPiece === position ? 'ring-2 ring-blue-500' : ''}
          ${isValidMove ? 'cursor-pointer' : ''}`}
      >
        {piece !== '.' && (
          <div className={`w-8 h-8 rounded-full shadow-lg transition-transform
            ${piece === 'w' ? 'bg-white border-2 border-gray-200' : 'bg-[#8B5CF6]'}
            ${selectedPiece === position ? 'transform scale-110' : ''}`}
          />
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
