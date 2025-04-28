
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

const fetchGameState = async () => {
  // Get the current URL parameters directly from the window location
  // This ensures we always get the latest parameters, even after URL updates
  const url = window.location.href;
  const params = new URLSearchParams(new URL(url).search);
  const stateParam = params.get('state');
  
  console.log("Fetching game state from URL:", stateParam);
  
  // Only return the state from URL if it exists and is valid
  if (stateParam && stateParam.length === 64 && /^[pw.]{64}$/.test(stateParam)) {
    return stateParam;
  }
  
  return null;
};

export const useGameState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [controllingPlayer, setControllingPlayer] = useState<Player | null>(null);

  // Query for game state updates with more frequent polling
  const { data: newGameState } = useQuery({
    queryKey: ['gameState', location.search],
    queryFn: fetchGameState,
    refetchInterval: 300, // Poll more frequently to ensure synchronization
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Handle game state updates from URL
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
  }, [newGameState, location.search, gameState, currentPlayer]);

  // Initialize game state from URL on first load
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
  }, []);

  // Update game state and URL when a move is made
  const updateGameState = (newGameState: string) => {
    console.log("Updating game state to:", newGameState);
    setGameState(newGameState);
    
    const nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
    console.log("Toggling current player to:", nextPlayer);
    setCurrentPlayer(nextPlayer);
    
    const params = new URLSearchParams();
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
