import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import GameCanvas from '../components/GameCanvas';
import GameUI from '../components/GameUI';
import { 
  ArrowLeftIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import localStorageService from '../services/localStorage';

const GameLevel: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isGameActive, setIsGameActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'tutorial' | 'gameplay' | 'boss' | 'complete'>('intro');
  const [gameSession, setGameSession] = useState(() => localStorageService.getGameState(parseInt(levelId || '1')));

  const levelIdNum = parseInt(levelId || '1');
  const currentLevel = state.levels.find(l => l.id === levelIdNum);

  const levelData = {
    1: {
      title: "Recursion & Time Complexity",
      subtitle: "Escape Room with Call Stack Traps",
      description: "Master the art of recursive magic and understand time complexity as you navigate through call stack traps.",
      algorithm: "Recursion",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      tutorial: "Click on doors to make recursive function calls. Watch the call stack grow and understand how recursion works.",
      objective: "Complete the recursive sequence to unlock the exit door."
    },
    2: {
      title: "Recursive Fibonacci",
      subtitle: "Fibonacci Chamber",
      description: "Solve the Fibonacci sequence using recursion to unlock the next chamber.",
      algorithm: "Recursion (Fibonacci)",
      timeComplexity: "O(2^n)",
      spaceComplexity: "O(n)",
      tutorial: "Navigate the Fibonacci tree and collect values to understand recursive calls.",
      objective: "Collect all Fibonacci values to complete the sequence."
    }
  };

  const levelInfo = levelData[levelIdNum as keyof typeof levelData] || levelData[1];

  useEffect(() => {
    if (currentLevel && !currentLevel.isUnlocked) {
      navigate('/');
      return;
    }
    // Always reset game state (including currentPhase) when navigating to a new level, even if completed
    setIsGameActive(false);
    setShowTutorial(true);
    setCurrentPhase('intro');
    dispatch({ type: 'SET_CURRENT_LEVEL', payload: levelIdNum });
  }, [levelIdNum, currentLevel, navigate, dispatch]);

  useEffect(() => {
    console.log('Current Level:', currentLevel);
    if (state.levels) {
      const nextLevel = state.levels.find(l => l.id === levelIdNum + 1);
      console.log('Next Level:', nextLevel);
    }
  }, [currentLevel, state.levels, levelIdNum]);

  const startGame = () => {
    setIsGameActive(true);
    setShowTutorial(false);
    setCurrentPhase('gameplay');
    dispatch({ type: 'START_GAME' });
  };

  const pauseGame = () => {
    setIsGameActive(false);
    dispatch({ type: 'END_GAME' });
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

  const handleGameEnd = (score: number) => {
    setIsGameActive(false);
    setCurrentPhase('complete');
    updateGameSession(score);
    const isReplay = currentLevel?.isCompleted || false;
    if (!isReplay) {
      dispatch({ 
        type: 'COMPLETE_LEVEL', 
        payload: {
          levelId: levelIdNum,
          score,
          timeSpent: 0,
          hintsUsed: 0
        }
      });
    } else {
      dispatch({ 
        type: 'REPLAY_LEVEL', 
        payload: {
          levelId: levelIdNum,
          score,
          timeSpent: 0,
          hintsUsed: 0
        }
      });
    }
  };

  const handleReplay = () => {
    setIsGameActive(false);
    setShowTutorial(true);
    setCurrentPhase('intro');
    localStorageService.resetGameState(levelIdNum);
    setGameSession(localStorageService.getGameState(levelIdNum));
  };

  // Only show completion overlay if the player just finished the level in this session
  const shouldShowCompletion = currentPhase === 'complete' && isGameActive === false;

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
      {/* Top bar: Back to Academy, Show Tutorial */}
      <div className="w-full max-w-4xl flex justify-between items-center mt-4 mb-2 z-30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Academy</span>
        </button>
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
        {/* Game Canvas: Only mount when game is active */}
        {isGameActive && (
          <div className="w-full aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative z-10">
            <GameCanvas
              level={currentLevel}
              onGameEnd={handleGameEnd}
            />
          </div>
        )}
        {/* Overlay Start Button when not active */}
        {!isGameActive && !showTutorial && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <button
              onClick={startGame}
              className="flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-10 py-6 rounded-2xl shadow-2xl text-3xl font-bold border-4 border-white/30 focus:outline-none focus:ring-4 focus:ring-green-400"
            >
              <PlayIcon className="h-10 w-10 mb-2" />
              Start
            </button>
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
        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gradient-to-br from-yellow-500/90 to-yellow-700/90 shadow-2xl rounded-xl p-6 max-w-md mx-4 border border-purple-500/30 relative">
              <button
                onClick={() => setShowTutorial(false)}
                className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/60 rounded-full p-1 shadow"
                aria-label="Close tutorial"
              >
                ×
              </button>
              <div className="text-center mb-4">
                <AcademicCapIcon className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-white mb-1">{levelInfo.title}</h2>
                <p className="text-purple-200 font-medium">{levelInfo.subtitle}</p>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Objective</h3>
                  <p className="text-gray-100 text-sm">{levelInfo.objective}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">How to Play</h3>
                  <p className="text-gray-100 text-sm">{levelInfo.tutorial}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-xs text-gray-200">Time Complexity</div>
                    <div className="text-blue-200 font-mono text-sm">{levelInfo.timeComplexity}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-xs text-gray-200">Space Complexity</div>
                    <div className="text-green-200 font-mono text-sm">{levelInfo.spaceComplexity}</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 mt-2">
                  <h3 className="text-base font-semibold text-white mb-1">Controls</h3>
                  <ul className="text-gray-100 text-sm list-disc list-inside">
                    <li>Move: <span className="font-mono">←/→</span> or <span className="font-mono">A/D</span></li>
                    <li>Jump: <span className="font-mono">↑</span> or <span className="font-mono">W</span> or <span className="font-mono">Space</span></li>
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
          </div>
        )}
      </div>
      {/* Game UI */}
      {isGameActive && (
        <GameUI level={currentLevel} isGameActive={isGameActive} onReplay={handleReplay} sessionScore={gameSession.currentScore} isReplay={currentLevel?.isCompleted} />
      )}
      {/* Completion Overlay */}
      {shouldShowCompletion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm mx-4 border border-purple-500/30 text-center relative">
            {/* Close Button */}
            <button
              onClick={() => setCurrentPhase('intro')}
              className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/60 rounded-full p-1 shadow transition-colors"
              aria-label="Close completion"
            >
              ×
            </button>
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-white mb-3">Quest Complete!</h2>
            {currentLevel?.isCompleted ? (
              <p className="text-gray-300 mb-4 text-sm">You've successfully mastered the level!</p>
            ) : (
              <>
                <p className="text-gray-300 mb-4 text-sm">You've successfully completed the level!</p>
                <p className="text-lg mb-2">Score: <span className="font-bold">{gameSession.currentScore}</span> / {currentLevel?.maxScore}</p>
              </>
            )}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Return to Academy
              </button>
              {levelIdNum < 5 && (
                <button
                  onClick={() => navigate(`/level/${levelIdNum + 1}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Next Quest
                </button>
              )}
              <button
                onClick={() => {
                  setIsGameActive(false);
                  setShowTutorial(true);
                  setCurrentPhase('intro');
                  localStorageService.resetGameState(levelIdNum);
                  setGameSession(localStorageService.getGameState(levelIdNum));
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLevel; 