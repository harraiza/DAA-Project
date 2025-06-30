import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import localStorageService, { UserProgress } from '../services/localStorage';

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
  levels: GameLevel[];
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

const allLevels: GameLevel[] = [
  {
    id: 1,
    title: "Recursion Escape",
    description: "Use recursive functions to unlock doors and escape the maze",
    algorithm: "Recursion",
    difficulty: "beginner",
    isUnlocked: true,
    isCompleted: false,
    score: 0,
    maxScore: 100,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)"
  },
  {
    id: 2,
    title: "Recursive Fibonacci",
    description: "Solve the Fibonacci sequence using recursion to unlock the next chamber.",
    algorithm: "Recursion (Fibonacci)",
    difficulty: "beginner",
    isUnlocked: false,
    isCompleted: false,
    score: 0,
    maxScore: 100,
    timeComplexity: "O(2^n)",
    spaceComplexity: "O(n)"
  }
];

const syncLevelsWithProgress = (levels: GameLevel[], userProgress: UserProgress): GameLevel[] => {
  const completedLevelIds = new Set(userProgress.completedLevels.map(l => l.levelId));
  return levels.map(level => {
    const isCompleted = completedLevelIds.has(level.id);
    const isUnlocked = level.id === 1 || completedLevelIds.has(level.id - 1);
    const completedData = userProgress.completedLevels.find(l => l.levelId === level.id);
    return {
      ...level,
      isCompleted,
      isUnlocked,
      score: completedData ? completedData.score : 0,
    };
  });
};

// Initial state from localStorage
const initialProgress = localStorageService.getUserProgress();

const initialState: GameState = {
  user: initialProgress,
  currentLevel: 1,
  levels: syncLevelsWithProgress(allLevels, initialProgress),
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
      const levels = syncLevelsWithProgress(state.levels, user);
      return { ...state, user, levels };
    }
    case 'SET_USER': {
      localStorageService.saveUserProgress(action.payload);
      return { ...state, user: action.payload };
    }
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'UNLOCK_LEVEL': {
      const updatedLevels = state.levels.map(level =>
        level.id === action.payload ? { ...level, isUnlocked: true } : level
      );
      return { ...state, levels: updatedLevels };
    }
    case 'COMPLETE_LEVEL': {
      console.log('COMPLETE_LEVEL action payload:', action.payload);
      const updatedUser = localStorageService.completeLevel(
        action.payload.levelId,
        action.payload.score,
        action.payload.timeSpent,
        action.payload.hintsUsed
      );
      console.log('User progress after completion:', updatedUser);
      const updatedLevels = syncLevelsWithProgress(state.levels, updatedUser);
      console.log('Levels after sync:', updatedLevels);
      return { ...state, user: updatedUser, levels: updatedLevels };
    }
    case 'REPLAY_LEVEL': {
      // For replaying levels without affecting progress
      console.log('Replaying level without rewards:', action.payload);
      return { ...state };
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
      const levels = syncLevelsWithProgress(allLevels, resetUser);
      return { ...initialState, user: resetUser, levels };
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