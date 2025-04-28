
import React from 'react';

interface GameStatusProps {
  currentPlayer: 'white' | 'purple';
  isMultipleCapture?: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({ currentPlayer, isMultipleCapture = false }) => {
  return (
    <div className="text-center">
      <div className="mb-2">
        <div className={`inline-block px-4 py-2 rounded-full ${
          currentPlayer === 'purple' ? 'bg-[#8B5CF6] text-white' : 'bg-white text-gray-800 border-2 border-gray-200'
        }`}>
          {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn
          {isMultipleCapture && (
            <span className="ml-2 font-bold animate-pulse">Multiple Capture!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStatus;
