
import { Player } from "../hooks/useGameState";

export const getOpponentUrl = (
  gameState: string,
  currentPlayer: Player,
  controllingPlayer: Player | null
) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  
  params.set('state', gameState);
  params.set('player', currentPlayer);
  params.set('role', controllingPlayer === 'white' ? 'purple' : 'white');
  
  url.search = params.toString();
  return url.toString();
};
