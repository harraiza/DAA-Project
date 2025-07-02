import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import localStorageService, { UserProgress } from '../services/localStorage';
import { LEVELS } from '../game/levels';

// Types
export interface GameLevel {
  id: number;
  title: string;
  description: string;
  algorithm: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isUnlocked: boolean;
  isCompleted: boolean;
  score: number;
  maxScore: number;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface GameState {
  user: UserProgress;
  currentLevel: number;
  gameMode: 'tutorial' | 'practice' | 'challenge';
  isGameActive: boolean;
  score: number;
  timeElapsed: number;
  hints: string[];
  currentHint: number;
}

export interface GameAction {
  type: string;
  payload?: any;
}

// Initial state from localStorage
const initialProgress = localStorageService.getUserProgress();

const initialState: GameState = {
  user: initialProgress,
  currentLevel: 1,
  gameMode: 'tutorial',
  isGameActive: false,
  score: 0,
  timeElapsed: 0,
  hints: [],
  currentHint: 0
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_PROGRESS': {
      const user = localStorageService.getUserProgress();
      return { ...state, user };
    }
    case 'SET_USER': {
      localStorageService.saveUserProgress(action.payload);
      return { ...state, user: action.payload };
    }
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'COMPLETE_LEVEL': {
      const canonicalLevel = LEVELS.find(l => l.id === action.payload.levelId);
      const maxScore = canonicalLevel?.maxScore || 100;
      const updatedUser = localStorageService.completeLevel(
        action.payload.levelId,
        action.payload.score,
        action.payload.timeSpent,
        action.payload.hintsUsed,
        maxScore
      );
      return { ...state, user: updatedUser };
    }
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    case 'START_GAME':
      return { ...state, isGameActive: true, score: 0, timeElapsed: 0 };
    case 'END_GAME':
      return { ...state, isGameActive: false };
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    case 'UPDATE_TIME':
      return { ...state, timeElapsed: action.payload };
    case 'SET_HINTS':
      return { ...state, hints: action.payload, currentHint: 0 };
    case 'NEXT_HINT':
      return { ...state, currentHint: Math.min(state.currentHint + 1, state.hints.length - 1) };
    case 'PREV_HINT':
      return { ...state, currentHint: Math.max(state.currentHint - 1, 0) };
    case 'UNLOCK_ACHIEVEMENT': {
      localStorageService.unlockAchievement(action.payload);
      const updatedUser = localStorageService.getUserProgress();
      return { ...state, user: updatedUser };
    }
    case 'UPDATE_PREFERENCES': {
      const updatedUser = localStorageService.updatePreferences(action.payload);
      return { ...state, user: updatedUser };
    }
    case 'RESET_PROGRESS': {
      const resetUser = localStorageService.resetProgress();
      return { ...initialState, user: resetUser };
    }
    default:
      return state;
  }
}

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // On mount, load progress from localStorage and sync level state
  useEffect(() => {
    dispatch({ type: 'LOAD_PROGRESS' });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
} 