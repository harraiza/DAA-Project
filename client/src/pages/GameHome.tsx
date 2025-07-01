import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { 
  PlayIcon, 
  LockClosedIcon,
  StarIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const GameHome: React.FC = () => {
  const { state } = useGame();

  const gameLevels = [
    {
      id: 1,
      title: "Recursive Factorial",
      subtitle: "Escape Room with Call Stack Traps",
      description: "Master the art of recursive magic and understand time complexity as you navigate through call stack traps.",
      difficulty: "Beginner",
      isUnlocked: true,
      stars: 0,
      algorithm: "Recursion",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    },
    {
      id: 2,
      title: "Recursive Fibonacci",
      subtitle: "Fibonacci Chamber",
      description: "Solve the Fibonacci sequence using recursion to unlock the next chamber.",
      difficulty: "Beginner",
      isUnlocked: state.user?.completedLevels?.some(l => l.levelId === 1) || false,
      stars: 0,
      algorithm: "Recursion (Fibonacci)",
      timeComplexity: "O(2^n)",
      spaceComplexity: "O(n)"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'Advanced': return 'bg-red-600/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <SparklesIcon className="h-20 w-20 text-purple-400" />
              <AcademicCapIcon className="h-12 w-12 text-blue-400 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to the <span className="text-purple-400">Mage Academy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            In a fractured world dominated by computational chaos, you are an apprentice algorithm mage. 
            Journey through algorithmic regions and restore order using your knowledge of algorithms and data structures.
          </p>
        </div>

        {/* Level Selection */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Choose Your Quest</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameLevels.map((level) => (
              <div
                key={level.id}
                className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                  level.isUnlocked
                    ? 'border-purple-500/50 hover:border-purple-400/70 cursor-pointer'
                    : 'border-gray-600/50 opacity-60 cursor-not-allowed'
                }`}
              >
                {!level.isUnlocked && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <LockClosedIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{level.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(level.difficulty)}`}>
                      {level.difficulty}
                    </span>
                  </div>
                  <p className="text-purple-300 text-sm font-medium mb-2">{level.subtitle}</p>
                  <p className="text-gray-300 text-sm">{level.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Algorithm:</span>
                    <span className="text-purple-300">{level.algorithm}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Time Complexity:</span>
                    <span className="text-blue-300">{level.timeComplexity}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Space Complexity:</span>
                    <span className="text-green-300">{level.spaceComplexity}</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= level.stars ? 'text-yellow-400 fill-current' : 'text-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  {level.isUnlocked && (
                    <Link
                      to={`/level/${level.id}`}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Start Quest</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Your Progress</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {state.user?.completedLevels?.length || 0}
                </div>
                <div className="text-gray-300">Levels Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {state.user?.level || 1}
                </div>
                <div className="text-gray-300">Mage Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {state.user?.achievements?.length || 0}
                </div>
                <div className="text-gray-300">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHome; 