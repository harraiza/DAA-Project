import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import GameNavbar from './components/GameNavbar';
import GameHome from './pages/GameHome';
import GameLevel from './pages/GameLevel';
import GameDashboard from './pages/GameDashboard';
import './index.css';

const App: React.FC = () => {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <GameNavbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<GameHome />} />
              <Route path="/level/:levelId" element={<GameLevel />} />
              <Route path="/dashboard" element={<GameDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  );
};

export default App; 