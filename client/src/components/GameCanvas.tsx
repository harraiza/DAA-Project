import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameLevel } from '../context/GameContext';
import { RecursionScene } from '../game/scenes/RecursionScene';
import { FibonacciScene } from '../game/scenes/FibonacciScene';

interface GameCanvasProps {
  level: GameLevel;
  onGameEnd: (score: number) => void;
}

const getSceneForLevel = (levelId: number) => {
  switch (levelId) {
    case 1:
      return RecursionScene;
    case 2:
      return FibonacciScene;
    default:
      return RecursionScene;
  }
};

const getSceneKeyForLevel = (levelId: number) => {
  switch (levelId) {
    case 1:
      return 'RecursionScene';
    case 2:
      return 'FibonacciScene';
    default:
      return 'RecursionScene';
  }
};

const GameCanvas: React.FC<GameCanvasProps> = ({ level, onGameEnd }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;

    const sceneKey = getSceneKeyForLevel(level.id);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: canvasRef.current,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 600 },
          debug: false
        }
      },
      scene: getSceneForLevel(level.id),
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      render: {
        pixelArt: false,
        antialias: true
      }
    };

    gameRef.current = new Phaser.Game(config);

    // After the game is created, get the scene instance and pass data to it.
    // We listen for the 'ready' event to ensure the scene is available.
    gameRef.current.events.on('ready', () => {
      const scene = gameRef.current?.scene.getScene(sceneKey);
      if (scene) {
        (scene as any).levelData = level;
        (scene as any).onGameEnd = onGameEnd;
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [level, onGameEnd]);

  return (
    <div className="w-full h-full min-h-[400px] min-w-[600px] flex-1">
      <div ref={canvasRef} className="w-full h-full min-h-[400px] min-w-[600px]" />
    </div>
  );
};

export default GameCanvas; 