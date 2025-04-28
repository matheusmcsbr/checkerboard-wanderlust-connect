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
  const storageKey = `game_state_${gameId}`;
  const storedState = localStorage.getItem(storageKey);
  
  // Use the URL state parameter if available and valid
  if (stateParam && stateParam.length === 64 && /^[pw.]{64}$/.test(stateParam)) {
    console.log("Found valid state in URL:", stateParam);
    // Store the state in localStorage for future retrieval
    localStorage.setItem(storageKey, stateParam);
    return stateParam;
  }
  
  // Otherwise use the stored state if available
  if (storedState && storedState.length === 64 && /^[pw.]{64}$/.test(storedState)) {
    console.log("Using state from localStorage:", storedState);
    return storedState;
  }
  
  console.log("No valid state found, using initial board");
  // Fall back to initial board if no valid state is found
  return INITIAL_BOARD;
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
    refetchInterval: 100, // Poll very frequently to ensure quick synchronization
    refetchOnWindowFocus: true,
    staleTime: 0
  });

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
      console.log("Setting game ID from URL:", urlGameId);
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
    }
  }, []);

  // Handle game state updates from URL or localStorage
  useEffect(() => {
    if (newGameState && newGameState !== gameState) {
      console.log("Game state updated from:", gameState, "to:", newGameState);
      setGameState(newGameState);
      
      // Make sure the game state is saved in localStorage for other tabs/windows
      localStorage.setItem(`game_state_${gameId}`, newGameState);
      
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
  }, [newGameState, location.search, gameId]);

  // Listen for storage events (for cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `game_state_${gameId}` && event.newValue) {
        console.log("Storage event detected with new game state:", event.newValue);
        if (event.newValue !== gameState && event.newValue.length === 64) {
          console.log("Updating game state from storage event");
          setGameState(event.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [gameId, gameState]);

  // Update game state and sync between players
  const updateGameState = (newGameState: string, continueTurn: boolean = false) => {
    console.log("Updating game state to:", newGameState);
    setGameState(newGameState);
    
    // Only toggle player if not continuing the same turn
    let nextPlayer = currentPlayer;
    if (!continueTurn) {
      nextPlayer = currentPlayer === 'white' ? 'purple' : 'white';
      console.log("Toggling current player to:", nextPlayer);
      setCurrentPlayer(nextPlayer);
    } else {
      console.log("Continuing turn for player:", currentPlayer);
    }
    
    // Store the updated game state in localStorage for syncing
    localStorage.setItem(`game_state_${gameId}`, newGameState);
    
    // Update the URL params
    const params = new URLSearchParams(location.search);
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
