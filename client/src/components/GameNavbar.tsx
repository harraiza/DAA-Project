import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { 
  HomeIcon, 
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Utility to get XP required for a given level
function getXpForLevel(level: number): number {
  return 1000 * Math.pow(2, level - 1);
}
function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

const GameNavbar: React.FC = () => {
  const { state } = useGame();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Mage Academy', icon: HomeIcon },
    { path: '/dashboard', label: 'Progress', icon: ChartBarIcon },
  ];

  // Get user info from localStorage or use default
  const user = state.user || {
    username: 'Apprentice Mage',
    level: 1,
    experience: 0,
    achievements: []
  };

  const currentLevel = user.level;
  const xpForCurrentLevel = getTotalXpForLevel(currentLevel);
  const xpForNextLevel = getTotalXpForLevel(currentLevel + 1);
  const xpThisLevel = user.experience - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-purple-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <SparklesIcon className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Mage Academy</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <div className="text-gray-300">
                <span className="text-purple-400 font-medium">{user.username}</span>
                <span className="mx-2">•</span>
                <span>Level {user.level}</span>
              </div>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (xpThisLevel / xpNeeded) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GameNavbar; 