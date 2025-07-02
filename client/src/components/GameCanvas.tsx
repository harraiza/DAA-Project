import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface GameCanvasProps {
  level: any; // LevelMeta from levels.ts
  onGameEnd: (score: number, levelId: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, onGameEnd }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;

    const sceneKey = level.sceneKey;
    const SceneClass = level.component;

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
      scene: SceneClass,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      render: {
        pixelArt: false,
        antialias: true
      },
      dom: {
        createContainer: true
      }
    };

    gameRef.current = new Phaser.Game(config);

    gameRef.current.events.on('ready', () => {
      const scene = gameRef.current?.scene.getScene(sceneKey);
      if (scene) {
        (scene as any).levelData = level;
        (scene as any).onGameEnd = (score: number) => onGameEnd(score, level.id);
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