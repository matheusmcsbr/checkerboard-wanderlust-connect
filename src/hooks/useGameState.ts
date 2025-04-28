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
  const stateParam = params.get('state');
  return stateParam || currentState;
};

export const useGameState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [controllingPlayer, setControllingPlayer] = useState<Player | null>(null);

  const { data: newGameState } = useQuery({
    queryKey: ['gameState', location.search],
    queryFn: () => fetchGameState(gameState),
    refetchInterval: 500,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  useEffect(() => {
    if (newGameState && newGameState !== gameState) {
      console.log("Game state updated from:", gameState, "to:", newGameState);
      setGameState(newGameState);
      
      const params = new URLSearchParams(location.search);
      const playerParam = params.get('player');
      
      if (playerParam === 'white' || playerParam === 'purple') {
        setCurrentPlayer(playerParam);
        console.log("Current player set from URL:", playerParam);
      } else {
        const nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
        setCurrentPlayer(nextPlayer);
        console.log("Current player toggled:", nextPlayer);
      }
    }
  }, [newGameState, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = params.get('state');
    const player = params.get('player');
    const role = params.get('role');
    
    if (state && state.length === 64 && /^[pw.]{64}$/.test(state)) {
      console.log("Initial game state set from URL:", state);
      setGameState(state);
    }
    
    if (player === 'white' || player === 'purple') {
      console.log("Initial current player set from URL:", player);
      setCurrentPlayer(player);
    }

    if (role === 'white' || role === 'purple') {
      console.log("Controlling player set from URL:", role);
      setControllingPlayer(role);
    } else if (!controllingPlayer) {
      console.log("Default controlling player set to white");
      setControllingPlayer('white');
    }
  }, [location.search]);

  const updateGameState = (newGameState: string) => {
    console.log("Updating game state to:", newGameState);
    setGameState(newGameState);
    
    const nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
    console.log("Toggling current player to:", nextPlayer);
    setCurrentPlayer(nextPlayer);
    
    const params = new URLSearchParams(location.search);
    params.set('state', newGameState);
    params.set('player', nextPlayer);
    
    if (controllingPlayer) {
      params.set('role', controllingPlayer);
    }
    
    const newUrl = `?${params.toString()}`;
    console.log("Updating URL to:", newUrl);
    navigate(newUrl, { replace: true });
  };

  return {
    gameState,
    currentPlayer,
    controllingPlayer,
    updateGameState
  };
};
