
import React from 'react';

export const GameInstructions = () => {
  return (
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
  );
};
