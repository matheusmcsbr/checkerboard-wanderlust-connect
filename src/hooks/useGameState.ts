
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

  // Add polling for game state changes
  const { data: newGameState } = useQuery({
    queryKey: ['gameState', location.search],
    queryFn: () => fetchGameState(gameState),
    refetchInterval: (data) => {
      // Only poll if you're the purple player and it's not your turn
      const params = new URLSearchParams(location.search);
      const role = params.get('role');
      const player = params.get('player');
      return (role === 'purple' && player === 'purple' && currentPlayer === 'white') ? 1000 : false;
    }
  });

  useEffect(() => {
    if (newGameState && newGameState !== gameState) {
      setGameState(newGameState);
      // Switch turns if the game state has changed
      setCurrentPlayer(currentPlayer === 'white' ? 'purple' : 'white');
    }
  }, [newGameState]);

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
    
    const params = new URLSearchParams();
    params.set('state', newGameState);
    params.set('player', currentPlayer === 'white' ? 'purple' : 'white');
    params.set('role', controllingPlayer || 'white');
    navigate(`?${params.toString()}`, { replace: true });
  };

  return {
    gameState,
    currentPlayer,
    controllingPlayer,
    updateGameState
  };
};
