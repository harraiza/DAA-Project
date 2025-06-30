import React from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { 
  StarIcon,
  TrophyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const GameDashboard: React.FC = () => {
  const { state } = useGame();

  const user = state.user || {
    username: 'Apprentice Mage',
    level: 1,
    experience: 0,
    achievements: [],
    completedLevels: [],
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
    }
  };

  const completedLevels = user.completedLevels || [];
  const totalScore = completedLevels.reduce((sum, level) => sum + level.score, 0);

  const achievements = [
    {
      id: 'first_level',
      name: 'First Steps',
      description: 'Complete your first algorithm quest',
      icon: '🌟',
      unlocked: completedLevels.length >= 1
    },
    {
      id: 'recursion_wizard',
      name: 'Recursion Wizard',
      description: 'Master the art of recursive magic',
      icon: '✨',
      unlocked: completedLevels.some(l => l.levelId === 1)
    },
    {
      id: 'fibonacci_master',
      name: 'Fibonacci Master',
      description: 'Solve the recursive Fibonacci chamber',
      icon: '🔢',
      unlocked: completedLevels.some(l => l.levelId === 2)
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <AcademicCapIcon className="h-20 w-20 text-purple-400" />
              <TrophyIcon className="h-12 w-12 text-yellow-400 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-purple-400">{user.username}</span>'s Progress
          </h1>
          <p className="text-xl text-gray-300">
            Track your journey as an algorithm mage
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Mage Progression</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    Level {user.level}
                  </div>
                  <div className="text-gray-300 mb-2">Current Level</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (user.experience % 1000) / 10)}%` 
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {user.experience % 1000} / 1000 XP
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {user.experience}
                  </div>
                  <div className="text-gray-300">Total Experience</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {completedLevels.length}
                  </div>
                  <div className="text-sm text-gray-300">Quests Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {unlockedAchievements.length}
                  </div>
                  <div className="text-sm text-gray-300">Achievements</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {user.statistics.streakDays || 0}
                  </div>
                  <div className="text-sm text-gray-300">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Level Completion */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Quest Progress</h2>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((levelId) => {
                  const completion = completedLevels.find(l => l.levelId === levelId);
                  const isCompleted = !!completion;
                  
                  return (
                    <div key={levelId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          {isCompleted ? (
                            <StarIcon className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white font-bold">{levelId}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            Quest {levelId}
                          </div>
                          {isCompleted && (
                            <div className="text-sm text-gray-300">
                              Score: {completion.score}/100
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isCompleted ? (
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-5 w-5 ${
                                star <= Math.floor(completion.score / 33) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Score</span>
                  <span className="text-white font-semibold">{totalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Score</span>
                  <span className="text-white font-semibold">
                    {completedLevels.length > 0 ? Math.round(totalScore / completedLevels.length) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Best Score</span>
                  <span className="text-white font-semibold">
                    {Math.max(...completedLevels.map(l => l.score), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Play Time</span>
                  <span className="text-white font-semibold">
                    {Math.round(user.statistics.totalPlayTime / 60)}m
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-green-600/20 border-green-500/30'
                        : 'bg-gray-600/20 border-gray-500/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className={`font-semibold ${
                          achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.name}
                        </div>
                        <div className={`text-sm ${
                          achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-center block"
                >
                  Return to Academy
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard; 