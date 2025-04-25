
import React from 'react';
import { toast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";

interface GameStatusProps {
  currentPlayer: 'white' | 'purple';
  gameUrl: string;
  controllingPlayer: 'white' | 'purple';
}

const GameStatus: React.FC<GameStatusProps> = ({ currentPlayer, gameUrl, controllingPlayer }) => {
  const copyUrl = () => {
    navigator.clipboard.writeText(gameUrl);
    toast({
      title: "Game URL Copied!",
      description: "Share this URL with your opponent to play together.",
    });
  };

  return (
    <div className="mb-6 text-center">
      <div className="mb-2">
        <h2 className="text-xl font-bold mb-1">You are playing as</h2>
        <div className={`inline-block px-4 py-2 rounded-full ${
          controllingPlayer === 'purple' ? 'bg-[#8B5CF6] text-white' : 'bg-white text-gray-800 border-2 border-gray-200'
        }`}>
          {controllingPlayer.charAt(0).toUpperCase() + controllingPlayer.slice(1)} Player
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">Current Turn</h2>
        <div className={`inline-block px-4 py-2 rounded-full ${
          currentPlayer === 'purple' ? 'bg-[#8B5CF6] text-white' : 'bg-white text-gray-800 border-2 border-gray-200'
        }`}>
          {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} Player
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={copyUrl}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-sm flex items-center gap-2 mx-auto"
        >
          <Copy size={16} />
          Share with Opponent
        </button>
      </div>
    </div>
  );
};

export default GameStatus;
