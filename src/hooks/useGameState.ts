import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export const INITIAL_BOARD = 'p.p.p.p.'
                         + '.p.p.p.p'
                         + 'p.p.p.p.'
                         + '........'
                         + '........'
                         + '.w.w.w.w'
                         + 'w.w.w.w.'
                         + '.w.w.w.w';

export type Player = 'white' | 'purple';

const fetchGameState = async (currentState: string) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  return params.get('state') || currentState;
};

export const useGameState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [controllingPlayer, setControllingPlayer] = useState<Player | null>(null);

  // Add polling for game state changes for both players
  const { data: newGameState } = useQuery({
    queryKey: ['gameState', location.search],
    queryFn: () => fetchGameState(gameState),
    refetchInterval: 1000, // Poll every second regardless of whose turn it is
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (newGameState && newGameState !== gameState) {
      setGameState(newGameState);
      
      // Extract player from URL to determine current turn
      const params = new URLSearchParams(location.search);
      const playerParam = params.get('player');
      
      // If URL has player param, use it to set current player
      if (playerParam === 'white' || playerParam === 'purple') {
        setCurrentPlayer(playerParam);
      } else {
        // Otherwise toggle based on previous state
        setCurrentPlayer(currentPlayer === 'white' ? 'purple' : 'white');
      }
    }
  }, [newGameState, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = params.get('state');
    const player = params.get('player');
    const role = params.get('role');
    
    if (state && state.length === 64 && /^[pw.]{64}$/.test(state)) {
      setGameState(state);
    }
    
    if (player === 'white' || player === 'purple') {
      setCurrentPlayer(player);
    }

    if (role === 'white' || role === 'purple') {
      setControllingPlayer(role);
    } else if (!controllingPlayer) {
      setControllingPlayer('white');
    }
  }, [location.search]);

  const updateGameState = (newGameState: string) => {
    setGameState(newGameState);
    setCurrentPlayer(currentPlayer === 'white' ? 'purple' : 'white');
    
    const params = new URLSearchParams(location.search);
    params.set('state', newGameState);
    params.set('player', currentPlayer === 'white' ? 'purple' : 'white');
    
    // Preserve the role parameter when updating game state
    if (controllingPlayer) {
      params.set('role', controllingPlayer);
    }
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  return {
    gameState,
    currentPlayer,
    controllingPlayer,
    updateGameState
  };
};
