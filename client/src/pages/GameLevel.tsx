import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import GameCanvas from '../components/GameCanvas';
import GameUI from '../components/GameUI';
import { 
  ArrowLeftIcon,
  AcademicCapIcon,
  PlayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import localStorageService from '../services/localStorage';
import { LEVELS } from '../game/levels';

// --- Level Complete Modal ---
const LevelCompleteModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onReplay: () => void;
  isReplay: boolean;
  score: number;
  maxScore: number;
  nextLevelTitle?: string;
}> = ({ open, onClose, onNext, onReplay, isReplay, score, maxScore, nextLevelTitle }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-zinc-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative border border-purple-500/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-black/30 hover:bg-black/60 rounded-full p-1 shadow transition-colors text-lg"
          aria-label="Close completion"
        >
          ×
        </button>
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-3">Quest Complete!</h2>
        {isReplay ? (
          <p className="text-gray-300 mb-4 text-sm">You've successfully mastered this level!</p>
        ) : (
          <>
            <p className="text-gray-300 mb-4 text-sm">You've successfully completed the level!</p>
            <div className="text-green-400 font-bold text-lg mb-2">+{maxScore} XP</div>
            {nextLevelTitle && (
              <div className="text-blue-300 text-base mt-2">Next: {nextLevelTitle}</div>
            )}
          </>
        )}
        <div className="space-y-3 mt-4">
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-base font-semibold"
          >
            Return to Academy
          </button>
          <button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-base font-semibold"
          >
            Next Level
          </button>
          <button
            onClick={onReplay}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-base font-semibold"
          >
            Replay
          </button>
        </div>
      </div>
    </div>
  );
};

const GameLevel: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isGameActive, setIsGameActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'tutorial' | 'gameplay' | 'boss' | 'complete'>('intro');
  const [gameSession, setGameSession] = useState(() => localStorageService.getGameState(parseInt(levelId || '1')));
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [isReplayModal, setIsReplayModal] = useState(false);

  const levelIdNum = parseInt(levelId || '1');
  const currentLevel = LEVELS.find(l => l.id === levelIdNum);
  const nextLevel = LEVELS.find(l => l.id === levelIdNum + 1);

  useEffect(() => {
    if (currentLevel && currentLevel.unlocksAtLevel && !state.user?.completedLevels?.some(l => l.levelId === currentLevel.unlocksAtLevel)) {
      navigate('/');
      return;
    }
    setIsGameActive(false);
    setShowTutorial(true);
    setCurrentPhase('intro');
    setShowCompletionModal(false);
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelIdNum });
  }, [levelIdNum, currentLevel, navigate, dispatch, state.user]);

  const startGame = () => {
    setIsGameActive(true);
    setShowTutorial(false);
    setCurrentPhase('gameplay');
    dispatch({ type: 'START_GAME' });
  };

  const resetGame = () => {
    setIsGameActive(false);
    setShowTutorial(true);
    setCurrentPhase('intro');
    dispatch({ type: 'UPDATE_SCORE', payload: 0 });
  };

  const updateGameSession = (score: number) => {
    const newSession = { ...gameSession, currentScore: score };
    setGameSession(newSession);
    localStorageService.saveGameState(newSession);
  };

  const handleGameEnd = (score: number, sceneLevelId?: number) => {
    setIsGameActive(false);
    setCurrentPhase('complete');
    updateGameSession(score);
    setLastScore(score);
    const usedLevelId = sceneLevelId || levelIdNum;
    const isReplay = state.user?.completedLevels?.some(l => l.levelId === usedLevelId) || false;
    setIsReplayModal(isReplay);
    if (!isReplay) {
      dispatch({ 
        type: 'COMPLETE_LEVEL', 
        payload: {
          levelId: usedLevelId,
          score,
          timeSpent: 0,
          hintsUsed: 0
        }
      });
      dispatch({ type: 'LOAD_PROGRESS' });
    } else {
      dispatch({ 
        type: 'REPLAY_LEVEL', 
        payload: {
          levelId: usedLevelId,
          score,
          timeSpent: 0,
          hintsUsed: 0
        }
      });
    }
    setShowCompletionModal(true);
  };

  const handleReplay = () => {
    setIsGameActive(false);
    setShowTutorial(true);
    setCurrentPhase('intro');
    setShowCompletionModal(false);
    localStorageService.resetGameState(levelIdNum);
    setGameSession(localStorageService.getGameState(levelIdNum));
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    navigate('/');
  };

  const handleNextLevel = () => {
    setShowCompletionModal(false);
    if (levelIdNum < LEVELS.length) {
      navigate(`/level/${levelIdNum + 1}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Progress checks
  const completedLevels = state.user?.completedLevels || [];
  const isCompleted = completedLevels.some(l => l.levelId === levelIdNum);
  const score = completedLevels.find(l => l.levelId === levelIdNum)?.score || 0;

  // Construct a GameLevel object for GameUI
  const gameLevelForUI = currentLevel ? {
    ...currentLevel,
    isUnlocked: !currentLevel.unlocksAtLevel || completedLevels.some(l => l.levelId === currentLevel.unlocksAtLevel),
    isCompleted,
    score,
    maxScore: currentLevel.maxScore,
    algorithm: currentLevel.algorithm,
    difficulty: currentLevel.difficulty,
    timeComplexity: currentLevel.timeComplexity,
    spaceComplexity: currentLevel.spaceComplexity,
    title: currentLevel.title,
    description: currentLevel.description,
  } : undefined;

  useEffect(() => {
    if (isCompleted && currentPhase === 'complete') {
      setShowCompletionModal(true);
    }
  }, [isCompleted, currentPhase]);

  // Find next level title
  const nextLevelTitle = nextLevel ? nextLevel.title : undefined;

  // Use currentLevel for all info
  const tutorial = currentLevel?.tutorial || 'Follow the on-screen instructions to complete the level.';
  const objective = currentLevel?.objective || 'Complete the level objective.';
  const title = currentLevel?.name || '';
  const subtitle = currentLevel?.description || '';
  const timeComplexity = currentLevel?.timeComplexity || '';
  const spaceComplexity = currentLevel?.spaceComplexity || '';

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Level Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Return to Academy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 flex flex-col items-center">
      {/* Top bar: Level Name, Back to Academy, Show Tutorial */}
      <div className="w-full max-w-4xl flex justify-between items-center mt-4 mb-2 z-30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg shadow-md transition-colors mr-50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Academy</span>
        </button>
        
        <span className="text-white font-bold text-lg ml-50">Level {currentLevel.id}: {currentLevel.name}</span>
        
        {!showTutorial && (
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition-colors"
          >
            Show Tutorial
          </button>
        )}
      </div>

      {/* Game Canvas and Overlayed Start/Reset Button */}
      <div className="relative w-full max-w-4xl flex flex-col items-center z-10">
        {/* Game Canvas or Tutorial Overlay: Only one is shown at a time */}
        {showTutorial ? (
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-yellow-500/90 to-yellow-700/90 shadow-2xl rounded-xl p-6 border border-purple-500/30 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowTutorial(false)}
              className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/60 rounded-full p-1 shadow"
              aria-label="Close tutorial"
            >
              ×
            </button>
            <div className="text-center mb-4">
              <AcademicCapIcon className="h-12 w-12 text-purple-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
              <p className="text-purple-200 font-medium">{subtitle}</p>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Objective</h3>
                <p className="text-gray-100 text-sm">{objective}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">How to Play</h3>
                <p className="text-gray-100 text-sm">{tutorial}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-xs text-gray-200">Time Complexity</div>
                  <div className="text-blue-200 font-mono text-sm">{timeComplexity}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-xs text-gray-200">Space Complexity</div>
                  <div className="text-green-200 font-mono text-sm">{spaceComplexity}</div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 mt-2">
                <h3 className="text-base font-semibold text-white mb-1">Controls</h3>
                <ul className="text-gray-100 text-sm list-disc list-inside">
                  {currentLevel?.controls && currentLevel.controls.length > 0 ? (
                    currentLevel.controls.map((ctrl, idx) => (
                      <li key={idx}>{ctrl.label}: <span className="font-mono">{ctrl.value}</span></li>
                    ))
                  ) : (
                    <>
                      <li>Move: <span className="font-mono">←/→</span></li>
                      <li>Jump: <span className="font-mono">↑</span></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowTutorial(false)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-2 rounded-lg shadow-lg text-base font-semibold transition-colors"
              >
                <span>Got it!</span>
              </button>
            </div>
          </div>
        ) : isGameActive ? (
          <div className="w-full aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative z-10">
            <GameCanvas
              level={currentLevel}
              onGameEnd={(score) => handleGameEnd(score, levelIdNum)}
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative z-10">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex-grow"></div>
              <button
                onClick={startGame}
                className="flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-10 py-6 rounded-2xl shadow-2xl text-3xl font-bold border-4 border-white/30 focus:outline-none focus:ring-4 focus:ring-green-400 mb-20"
              >
                <PlayIcon className="h-10 w-10 mb-2" />
                Start
              </button>
              <div className="flex-grow"></div>
            </div>
          </div>
        )}
        {/* Reset button (bottom right) when game is active */}
        {isGameActive && (
          <button
            onClick={resetGame}
            className="fixed bottom-12 right-12 z-40 flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-colors"
          >
            <ArrowPathIcon className="h-6 w-6" />
            <span>Reset</span>
          </button>
        )}
      </div>
      {/* Game UI */}
      {isGameActive && gameLevelForUI && (
        <GameUI level={gameLevelForUI} isGameActive={isGameActive} onReplay={handleReplay} sessionScore={gameSession.currentScore} isReplay={isCompleted} />
      )}
      {/* Level Complete Modal */}
      <LevelCompleteModal
        open={showCompletionModal}
        onClose={handleCloseModal}
        onNext={handleNextLevel}
        onReplay={handleReplay}
        isReplay={isReplayModal}
        score={lastScore}
        maxScore={currentLevel?.maxScore || 100}
        nextLevelTitle={nextLevelTitle}
      />
    </div>
  );
};

export default GameLevel; 