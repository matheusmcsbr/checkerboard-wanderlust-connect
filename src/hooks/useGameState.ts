
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const INITIAL_BOARD = 'p.p.p.p.'
                         + '.p.p.p.p'
                         + 'p.p.p.p.'
                         + '........'
                         + '........'
                         + '.w.w.w.w'
                         + 'w.w.w.w.'
                         + '.w.w.w.w';

export type Player = 'white' | 'purple';

export const useGameState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [controllingPlayer, setControllingPlayer] = useState<Player | null>(null);

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
