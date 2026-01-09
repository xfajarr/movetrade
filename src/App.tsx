/**
 * Simplified App Component
 * 
 * Desktop-responsive layout with feature hooks
 * Now with Tournament Page for driver selection
 * Mobile-first design with bottom navigation
 */

import React, { useState } from 'react';
import { GameSounds } from './components/GameSounds';
import { BottomNav } from './components/BottomNav';
import { TournamentPage } from './pages/TournamentPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RacePage } from './pages/RacePage';
import { useMarketData } from './features/market/hooks/useMarketData';
import { useSocialData } from './features/social/hooks/useSocialData';
import { useWalletSync } from './features/player/hooks/useWalletSync';

function App() {
  const [currentPage, setCurrentPage] = useState<'tournament' | 'race' | 'stats' | 'profile'>('tournament');

  // Initialize market data (starts price simulation)
  useMarketData();

  // Initialize social data (loads leaderboard and tournaments)
  useSocialData();

  // Sync wallet balance with player store
  useWalletSync();

  const handleStartRace = () => {
    setCurrentPage('race');
  };

  const handleBackToTournament = () => {
    setCurrentPage('tournament');
  };

  const handleNavigate = (page: 'tournament' | 'race' | 'stats' | 'profile') => {
      setCurrentPage(page);
  };

  // Race Page Integration
  if (currentPage === 'race') {
     return (
        <div className="w-full h-[100dvh] bg-game-dark overflow-hidden">
           <GameSounds />
           <RacePage onBack={handleBackToTournament} />
           <BottomNav 
              activePage={currentPage} 
              onNavigate={handleNavigate} 
           />
        </div>
     );
  }

  // Lobby / Stats / Profile Layout
  return (
    <div className="w-full h-[100dvh] bg-game-dark overflow-hidden flex flex-col">
      <GameSounds />
      
      {/* Page Content */}
      <div className="flex-1 overflow-hidden relative">
          {currentPage === 'tournament' && <TournamentPage onStartRace={handleStartRace} />}
          {currentPage === 'stats' && <StatsPage />}
          {currentPage === 'profile' && <ProfilePage />}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav 
          activePage={currentPage} 
          onNavigate={handleNavigate} 
      />
    </div>
  );
}

export default App;
