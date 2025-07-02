// Types for localStorage data

export interface UserProgress {
  id: string;
  username: string;
  level: number;
  experience: number;
  completedLevels: CompletedLevel[];
  achievements: Achievement[];
  preferences: UserPreferences;
  statistics: UserStatistics;
  lastPlayed: string;
}

export interface CompletedLevel {
  levelId: number;
  score: number;
  completedAt: string;
  timeSpent: number;
  attempts: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  tutorialEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserStatistics {
  totalPlayTime: number;
  levelsCompleted: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  algorithmsLearned: number;
  streakDays: number;
  hintsUsed: number;
  problemsSolved: number;
  lastPlayed: string;
}

// Default user progress
const defaultProgress: UserProgress = {
  id: 'default-user',
  username: 'Algorithm Explorer',
  level: 1,
  experience: 0,
  completedLevels: [],
  achievements: [],
  preferences: {
    theme: 'dark',
    soundEnabled: true,
    tutorialEnabled: true,
    difficulty: 'medium'
  },
  statistics: {
    totalPlayTime: 0,
    levelsCompleted: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    algorithmsLearned: 0,
    streakDays: 0,
    hintsUsed: 0,
    problemsSolved: 0,
    lastPlayed: new Date().toISOString()
  },
  lastPlayed: new Date().toISOString()
};

// Storage keys
const STORAGE_KEYS = {
  USER_PROGRESS: 'algorithm-quest-user-progress',
  GAME_STATE: 'algorithm-quest-game-state',
  SETTINGS: 'algorithm-quest-settings'
};

// Game state type
export interface GameSessionState {
  levelId: number;
  currentScore: number;
  // Add more session-specific fields as needed
}

class LocalStorageService {
  // Get user progress
  getUserProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default progress
      this.saveUserProgress(defaultProgress);
      return defaultProgress;
    } catch (error) {
      console.error('Error loading user progress:', error);
      return defaultProgress;
    }
  }

  // Save user progress
  saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  // Update user progress
  updateUserProgress(updates: Partial<UserProgress>): UserProgress {
    const current = this.getUserProgress();
    const updated = { ...current, ...updates };
    this.saveUserProgress(updated);
    return updated;
  }

  // Complete a level
  completeLevel(levelId: number, score: number, timeSpent: number, hintsUsed: number): UserProgress {
    const progress = this.getUserProgress();
    
    // Calculate experience
    const baseExperience = 100;
    const scoreBonus = Math.floor((score / 100) * 50);
    const timeBonus = Math.max(0, 25 - Math.floor(timeSpent / 60));
    const hintPenalty = hintsUsed * 5;
    const totalExperience = baseExperience + scoreBonus + timeBonus - hintPenalty;
    
    // Update experience and level
    const newExperience = progress.experience + totalExperience;
    const newLevel = Math.floor(newExperience / 1000) + 1;
    
    // Update completed levels immutably
    let updated = false;
    const updatedCompletedLevels = progress.completedLevels.map(c => {
      if (c.levelId === levelId) {
        updated = true;
        return {
          ...c,
          score: Math.max(score, c.score),
          completedAt: new Date().toISOString(),
          attempts: c.attempts + 1
        };
      }
      return c;
    });
    if (!updated) {
      updatedCompletedLevels.push({
        levelId,
        score,
        completedAt: new Date().toISOString(),
        timeSpent,
        attempts: 1
      });
    }
    const newProgress = { ...progress, completedLevels: updatedCompletedLevels };
    
    // Update statistics
    newProgress.statistics = { ...progress.statistics };
    newProgress.statistics.problemsSolved += 1;
    newProgress.statistics.totalPlayTime += timeSpent;
    newProgress.statistics.hintsUsed += hintsUsed;
    newProgress.statistics.totalScore += score;
    newProgress.statistics.bestScore = Math.max(progress.statistics.bestScore, score);
    newProgress.statistics.averageScore = newProgress.statistics.totalScore / newProgress.statistics.problemsSolved;
    newProgress.statistics.levelsCompleted = newProgress.completedLevels.length;
    newProgress.statistics.lastPlayed = new Date().toISOString();
    // Update main progress
    newProgress.experience = newExperience;
    newProgress.level = newLevel;
    newProgress.lastPlayed = new Date().toISOString();
    this.saveUserProgress(newProgress);
    return newProgress;
  }

  // Unlock achievement
  unlockAchievement(achievement: Omit<Achievement, 'unlockedAt'>): boolean {
    const progress = this.getUserProgress();
    const existingAchievement = progress.achievements.find(a => a.id === achievement.id);
    
    if (!existingAchievement) {
      progress.achievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
      });
      this.saveUserProgress(progress);
      return true;
    }
    return false;
  }

  // Update preferences
  updatePreferences(preferences: Partial<UserPreferences>): UserProgress {
    const progress = this.getUserProgress();
    progress.preferences = { ...progress.preferences, ...preferences };
    this.saveUserProgress(progress);
    return progress;
  }

  // Update play time
  updatePlayTime(seconds: number): void {
    const progress = this.getUserProgress();
    progress.statistics.totalPlayTime += seconds;
    progress.lastPlayed = new Date().toISOString();
    this.saveUserProgress(progress);
  }

  // Reset progress
  resetProgress(): UserProgress {
    this.saveUserProgress(defaultProgress);
    return defaultProgress;
  }

  // Get game statistics
  getStatistics() {
    const progress = this.getUserProgress();
    return {
      levelProgress: {
        current: progress.level,
        experience: progress.experience,
        experienceToNext: Math.max(0, (progress.level + 1) * 1000 - progress.experience)
      },
      performance: {
        averageScore: progress.statistics.averageScore,
        problemsSolved: progress.statistics.problemsSolved,
        hintsUsed: progress.statistics.hintsUsed,
        efficiency: progress.statistics.problemsSolved > 0 
          ? (progress.statistics.averageScore / (progress.statistics.hintsUsed + 1)).toFixed(2)
          : 0
      },
      engagement: {
        totalPlayTime: progress.statistics.totalPlayTime,
        streakDays: progress.statistics.streakDays,
        completedLevels: progress.completedLevels.length
      },
      achievements: {
        total: progress.achievements.length,
        recent: progress.achievements.slice(-5)
      }
    };
  }

  // Check if level is unlocked
  isLevelUnlocked(levelId: number): boolean {
    if (levelId === 1) return true;
    const progress = this.getUserProgress();
    return progress.completedLevels.some(c => c.levelId === levelId - 1);
  }

  // Get level completion status
  getLevelStatus(levelId: number) {
    const progress = this.getUserProgress();
    const completion = progress.completedLevels.find(c => c.levelId === levelId);
    return {
      isCompleted: !!completion,
      score: completion?.score || 0,
      attempts: completion?.attempts || 0,
      isUnlocked: this.isLevelUnlocked(levelId)
    };
  }

  // Export data (for backup)
  exportData(): string {
    const progress = this.getUserProgress();
    return JSON.stringify(progress, null, 2);
  }

  // Import data (for restore)
  importData(data: string): boolean {
    try {
      const progress = JSON.parse(data);
      this.saveUserProgress(progress);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Game session state methods
  getGameState(levelId: number): GameSessionState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATE + '-' + levelId);
      if (stored) {
        return JSON.parse(stored);
      }
      // Default session state
      const defaultState: GameSessionState = { levelId, currentScore: 0 };
      this.saveGameState(defaultState);
      return defaultState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return { levelId, currentScore: 0 };
    }
  }

  saveGameState(state: GameSessionState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE + '-' + state.levelId, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }

  resetGameState(levelId: number): void {
    this.saveGameState({ levelId, currentScore: 0 });
  }
}

export const localStorageService = new LocalStorageService();
export default localStorageService; 