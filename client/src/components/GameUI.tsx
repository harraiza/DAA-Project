import React from 'react';
import { GameLevel } from '../context/GameContext';
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

  const handleNextLevel = () => {
    const nextLevel = level.id < 5 ? level.id + 1 : null;
    if (nextLevel) {
      navigate(`/level/${nextLevel}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* Game UI content can be added here if needed */}
    </>
  );
});

export default GameUI; 