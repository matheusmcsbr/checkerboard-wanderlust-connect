
import { Player } from "../hooks/useGameState";

export const getOpponentUrl = (
  gameState: string,
  currentPlayer: Player,
  controllingPlayer: Player | null
) => {
  // Create a new URL based on the current window location
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  
  // Always set the latest game state
  params.set('state', gameState);
  
  // Set the current player's turn
  params.set('player', currentPlayer);
  
  // Set the role for the opponent
  params.set('role', controllingPlayer === 'white' ? 'purple' : 'white');
  
  // Replace the URL search parameters
  url.search = params.toString();
  return url.toString();
};
