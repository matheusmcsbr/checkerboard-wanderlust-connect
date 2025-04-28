
import { Player } from "../hooks/useGameState";

export const getOpponentUrl = (
  gameState: string,
  currentPlayer: Player,
  controllingPlayer: Player | null,
  gameId: string
) => {
  // Create a new URL based on the current window location
  const baseUrl = window.location.origin + window.location.pathname;
  const url = new URL(baseUrl);
  const params = new URLSearchParams();
  
  // Always set the latest game state
  params.set('state', gameState);
  
  // Set the current player's turn
  params.set('player', currentPlayer);
  
  // Set the role for the opponent (opposite of controlling player)
  params.set('role', controllingPlayer === 'white' ? 'purple' : 'white');
  
  // Include the game ID for synchronization
  params.set('gameId', gameId);
  
  // Replace the URL search parameters
  url.search = params.toString();
  console.log("Generated opponent URL:", url.toString());
  return url.toString();
};
