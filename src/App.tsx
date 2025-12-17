/**
 * Simplified App Component
 * 
 * Desktop-responsive layout with feature hooks
 * Now with Tournament Page for driver selection
 * Mobile-first design with bottom navigation
 */

import React, { useState } from 'react';
import { RacingChart } from './components/RacingChart';
import { PredictionButtons } from './components/PredictionButtons';
import { BetStatus } from './components/BetStatus';
import { SidePanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import { GameSounds } from './components/GameSounds';
import { BottomNav } from './components/BottomNav';
import { TournamentPage } from './pages/TournamentPage';
import { useMarketData } from './features/market/hooks/useMarketData';
import { useSocialData } from './features/social/hooks/useSocialData';

function App() {
  const [currentPage, setCurrentPage] = useState<'tournament' | 'race'>('tournament');
  const [panelOpen, setPanelOpen] = useState(false); // Mobile drawer
  const [leftPanelOpen, setLeftPanelOpen] = useState(true); // Desktop left panel
  const [activeTab, setActiveTab] = useState<'history' | 'leaderboard' | 'tournaments'>('history');

  // Initialize market data (starts price simulation)
  useMarketData();

  // Initialize social data (loads leaderboard and tournaments)
  useSocialData();

  const openHistory = () => {
    setActiveTab('history');
    setPanelOpen(true);
  };

  const openLeaderboard = () => {
    setActiveTab('leaderboard');
    setPanelOpen(true);
  };

  const handleStartRace = () => {
    setCurrentPage('race');
  };

  const handleBackToTournament = () => {
    setCurrentPage('tournament');
  };

  // Tournament Page
  if (currentPage === 'tournament') {
    return (
      <div className="w-full h-screen bg-game-dark overflow-hidden">
        <GameSounds />
        <TournamentPage onStartRace={handleStartRace} />
        <BottomNav onMenuClick={handleBackToTournament} />
      </div>
    );
  }

  // Race Page (Original Layout) - Mobile-First
  return (
    <div className="w-full h-[100dvh] bg-game-dark flex flex-col text-white font-sans overflow-hidden relative selection:bg-game-accent selection:text-black">

      <GameSounds />

      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.05),transparent_50%)] pointer-events-none" />

      {/* FIXED TOP BAR */}
      <div className="flex-none z-40 relative">
        <TopBar onToggleHistory={openHistory} onToggleLeaderboard={openLeaderboard} />
        
        {/* MENU Button - Desktop Only */}
        <button
          onClick={handleBackToTournament}
          className="hidden sm:flex absolute top-4 right-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/40 hover:to-red-500/40 backdrop-blur-md px-5 py-2.5 rounded-xl border-2 border-orange-500/50 hover:border-orange-400 text-sm font-black text-white transition-all hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          MENU
        </button>
      </div>

      {/* MAIN CONTENT - DESKTOP RESPONSIVE (3-COLUMN LAYOUT) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative max-w-[1920px] mx-auto w-full lg:gap-4 lg:p-4 lg:overflow-hidden">

        {/* LEFT COLUMN: LEADERBOARD/HISTORY (Desktop Only) - Scrollable */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${leftPanelOpen ? 'w-80 xl:w-96 opacity-100' : 'w-0 opacity-0'}`}>
          <div className="flex-1 bg-[#0a1220] rounded-2xl border border-white/5 overflow-auto min-w-[20rem]">
            <SidePanel
              isOpen={true}
              onClose={() => { }}
              initialTab={activeTab}
              desktopMode={true}
            />
          </div>
        </div>

        {/* MIDDLE COLUMN: CHART - Scrollable on desktop */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-[#080f1e] lg:rounded-2xl lg:border lg:border-white/5 lg:overflow-auto group">
          
          {/* Left Panel Toggle Button (Desktop) */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="hidden lg:flex absolute top-4 left-4 z-20 w-8 h-8 items-center justify-center bg-[#0a1220]/80 hover:bg-[#0a1220] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
            title={leftPanelOpen ? "Close Panel" : "Open Panel"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${leftPanelOpen ? 'rotate-180' : 'rotate-0'}`}
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
          </button>

          <div className="absolute inset-0 pb-4 lg:pb-0 opacity-90">
            <RacingChart />
          </div>
          
          {/* Mobile Controls Overlay (Hidden on Desktop) */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent pb-safe pt-6 px-3 mb-16">
             <BetStatus />
             <div className="mt-1.5">
                <PredictionButtons />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TRADING CONTROLS (Desktop Only) - Scrollable */}
        <div className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0a1220]/90 rounded-2xl border border-white/5 p-3 gap-3 overflow-y-auto custom-scrollbar shadow-lg">
          <div className="flex-none">
             <BetStatus verticalMode={true} />
          </div>
          <div className="flex-none mt-auto">
             <PredictionButtons verticalMode={true} />
          </div>
        </div>

        {/* Mobile drawer overlay */}
        <div className="lg:hidden">
          <SidePanel
            isOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
            initialTab={activeTab}
          />
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onMenuClick={handleBackToTournament} />

    </div>
  );
}

export default App;
