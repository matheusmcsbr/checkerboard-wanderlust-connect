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

// Generate a unique game ID for this session if none exists
const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Get or create game ID from localStorage
const getGameId = () => {
  const existingId = localStorage.getItem('checkers_game_id');
  if (existingId) return existingId;
  
  const newId = generateGameId();
  localStorage.setItem('checkers_game_id', newId);
  return newId;
};

const fetchGameState = async () => {
  // Get the current URL parameters
  const url = window.location.href;
  const params = new URLSearchParams(new URL(url).search);
  const stateParam = params.get('state');
  const gameId = params.get('gameId') || getGameId();
  
  // Check localStorage for the most recent state for this game ID
  const storedState = localStorage.getItem(`game_state_${gameId}`);
  
  // Use the URL state parameter if available and valid
  if (stateParam && stateParam.length === 64 && /^[pw.]{64}$/.test(stateParam)) {
    // Store the state in localStorage for future retrieval
    localStorage.setItem(`game_state_${gameId}`, stateParam);
    console.log("Fetched game state from URL:", stateParam);
    return stateParam;
  }
  
  // Otherwise use the stored state if available
  if (storedState && storedState.length === 64 && /^[pw.]{64}$/.test(storedState)) {
    console.log("Fetched game state from localStorage:", storedState);
    return storedState;
  }
  
  // Fall back to null if no valid state is found
  return null;
};

export const useGameState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [controllingPlayer, setControllingPlayer] = useState<Player | null>(null);
  const [gameId, setGameId] = useState<string>(getGameId());

  // Query for game state updates with frequent polling
  const { data: newGameState } = useQuery({
    queryKey: ['gameState', location.search, gameId],
    queryFn: fetchGameState,
    refetchInterval: 250, // Poll very frequently to ensure quick synchronization
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Handle game state updates from URL or localStorage
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
        // Calculate next player based on comparing the states
        let nextPlayer: Player;
        
        // Count pieces to determine who just moved
        const countPieces = (state: string) => {
          const whitePieces = (state.match(/w/g) || []).length;
          const purplePieces = (state.match(/p/g) || []).length;
          return { whitePieces, purplePieces };
        };
        
        const oldCounts = countPieces(gameState);
        const newCounts = countPieces(newGameState);
        
        // If purple has fewer pieces in the new state, white just captured
        if (oldCounts.purplePieces > newCounts.purplePieces) {
          nextPlayer = 'purple'; // Purple's turn after white captured
        } 
        // If white has fewer pieces in the new state, purple just captured
        else if (oldCounts.whitePieces > newCounts.whitePieces) {
          nextPlayer = 'white'; // White's turn after purple captured
        }
        // Otherwise toggle based on current player
        else {
          nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
        }
        
        setCurrentPlayer(nextPlayer);
        console.log("Current player determined by game state:", nextPlayer);
      }
    }
  }, [newGameState, location.search, gameState, currentPlayer]);

  // Initialize game state from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const state = params.get('state');
    const player = params.get('player');
    const role = params.get('role');
    const urlGameId = params.get('gameId');
    
    // Set game ID from URL or use/create localStorage one
    if (urlGameId) {
      setGameId(urlGameId);
      localStorage.setItem('checkers_game_id', urlGameId);
    }
    
    if (state && state.length === 64 && /^[pw.]{64}$/.test(state)) {
      console.log("Initial game state set from URL:", state);
      setGameState(state);
      // Store in localStorage for sync
      localStorage.setItem(`game_state_${gameId}`, state);
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

  // Update game state and sync between players
  const updateGameState = (newGameState: string) => {
    console.log("Updating game state to:", newGameState);
    setGameState(newGameState);
    
    const nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
    console.log("Toggling current player to:", nextPlayer);
    setCurrentPlayer(nextPlayer);
    
    // Store the updated game state in localStorage for syncing
    localStorage.setItem(`game_state_${gameId}`, newGameState);
    
    // Update the URL params
    const params = new URLSearchParams();
    params.set('state', newGameState);
    params.set('player', nextPlayer);
    params.set('gameId', gameId);
    
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
    gameId,
    updateGameState
  };
};
