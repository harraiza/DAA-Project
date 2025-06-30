import React from 'react';
import { GameLevel } from '../context/GameContext';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

interface GameUIProps {
  level: GameLevel;
  isGameActive: boolean;
  onReplay?: () => void;
  sessionScore: number;
  isReplay: boolean;
}

const GameUI: React.FC<GameUIProps> = React.memo(({ level, isGameActive, onReplay, sessionScore, isReplay }) => {
  const navigate = useNavigate();

  // Always show modal if level is completed
  const shouldShowModal = level.isCompleted;

  const handleNextLevel = () => {
    const nextLevel = level.id < 5 ? level.id + 1 : null;
    if (nextLevel) {
      navigate(`/level/${nextLevel}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Only show level name and number in the top bar
  return (
    <>
      {/* Top Bar: Level Name and Number */}
      <div className="fixed top-16 left-0 right-0 z-20 flex justify-center items-center px-8 py-3 bg-black/70 backdrop-blur-md shadow-lg">
        <span className="text-white font-bold text-lg">Level {level.id}: {level.title}</span>
      </div>
      {/* Right Side Progress Bar (only show when game is active) */}
      {isGameActive && (
        <div className="fixed top-32 right-8 z-20 flex flex-col items-center">
          <span className="text-white text-xs mb-2">Progress</span>
          <div className="w-3 h-48 bg-gray-700 rounded-full overflow-hidden border border-blue-400 shadow-inner flex flex-col justify-end">
            <div
              className="w-full bg-gradient-to-t from-green-400 to-blue-500 rounded-b-full transition-all duration-300 shadow"
              style={{ 
                height: `${Math.min(100, (sessionScore / (level.maxScore || 100)) * 100)}%` 
              }}
            />
          </div>
          <div className="text-white text-xs mt-2 text-center">
            {sessionScore}/{level.maxScore || 100}
          </div>
        </div>
      )}
      {/* Level Complete Modal */}
      {/* {level.isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Level Complete!</h2>
            {isReplay ? (
              <p className="text-gray-600 mb-4 text-sm">You've successfully mastered the level!</p>
            ) : (
              <>
                <p className="text-gray-600 mb-4 text-sm">You've successfully completed the level!</p>
                <p className="text-lg mb-2">Score: <span className="font-bold">{sessionScore}</span> / {level.maxScore}</p>
              </>
            )}
            <button
              onClick={handleNextLevel}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow"
            >
              Next Level
            </button>
            <button
              onClick={onReplay}
              className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow ml-2"
            >
              Replay
            </button>
          </div>
        </div>
      )} */}
    </>
  );
});

export default GameUI; 