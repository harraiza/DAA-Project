import React from 'react';
import { GameLevel } from '../context/GameContext';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

interface GameUIProps {
  level: GameLevel;
}

const GameUI: React.FC<GameUIProps> = React.memo(({ level }) => {
  const { state } = useGame();
  const navigate = useNavigate();

  // Always show modal if level is completed
  const shouldShowModal = level.isCompleted;

  const handleNextLevel = () => {
    const nextLevel = state.levels.find(l => l.id === level.id + 1);
    if (nextLevel && nextLevel.isUnlocked) {
      navigate(`/level/${nextLevel.id}`);
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
      <div className="fixed top-32 right-8 z-20 flex flex-col items-center">
        <span className="text-white text-xs mb-2">Progress</span>
        <div className="w-3 h-48 bg-gray-700 rounded-full overflow-hidden border border-blue-400 shadow-inner flex flex-col justify-end">
          <div
            className="w-full bg-gradient-to-t from-green-400 to-blue-500 rounded-b-full transition-all duration-300 shadow"
            style={{ height: `${(level.maxScore ? state.score / level.maxScore : 0) * 100}%` }}
          />
        </div>
      </div>
      {/* Level Complete Modal */}
      {level.isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Level Complete!</h2>
            <p className="text-lg mb-2">Score: <span className="font-bold">{level.score}</span> / {level.maxScore}</p>
            <button
              onClick={() => {
                const nextLevel = state.levels.find(l => l.id === level.id + 1 && l.isUnlocked);
                if (nextLevel) {
                  window.location.href = `/level/${nextLevel.id}`;
                } else {
                  window.location.href = '/dashboard';
                }
              }}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow"
            >
              Next Level
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default GameUI; 