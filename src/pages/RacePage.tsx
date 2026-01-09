import React, { useState } from 'react';
import { RacingChart } from '../components/RacingChart';
import { PredictionButtons } from '../components/PredictionButtons';
import { BetStatus } from '../components/BetStatus';
import { TopBar } from '../components/TopBar';
import { SidePanel } from '../components/SidePanel';

interface RacePageProps {
  onBack: () => void;
}

export const RacePage: React.FC<RacePageProps> = ({ onBack }) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'leaderboard'>('history');

  // Supress unused
  void setPanelOpen;
  void setActiveTab;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black selection:bg-game-accent selection:text-black animate-in fade-in duration-700">
      
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.03),transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-150 contrast-150 mix-blend-overlay" />
          {/* Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[size:100%_4px] pointer-events-none opacity-20" />
      </div>

      {/* Top HUD */}
      <div className="flex-none z-40 relative border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <TopBar />
        
        {/* Menu/Back Button (Desktop) */}
        <button
          onClick={onBack}
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-4 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors items-center gap-2 group"
        >
          <svg className="w-3 h-3 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Lobby
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden flex flex-col lg:flex-row">
          
          {/* Chart / Race Area */}
          <div className="flex-1 relative z-10 bg-[#080f1e]/50">
             <div className="absolute inset-0 flex flex-col">
                 <RacingChart />
             </div>
             
             {/* HUD Overlays (Corners) */}
             <div className="absolute top-4 left-4 pointer-events-none hidden lg:block">
                <div className="text-[10px] items-center gap-2 flex font-mono text-game-accent/50 uppercase tracking-widest border border-game-accent/20 px-2 py-1 rounded bg-black/40">
                    <div className="w-1.5 h-1.5 bg-game-accent rounded-full animate-pulse shadow-[0_0_5px_#00f0ff]" />
                    Live Feed
                </div>
             </div>
          </div>

          {/* Desktop Right Panel (Trading Details) - Optional or Integrated */}
          {/* For now, keeping the mobile-first focus which overlays controls at bottom */}

      </div>

      {/* Bottom Control Deck (Mobile/Desktop Unified) */}
      <div className="flex-none z-50 relative">
          
          {/* Decorative Top Border for Deck */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-game-accent/50 to-transparent shadow-[0_0_10px_#00f0ff]" />

          <div className="bg-[#050b14]/90 backdrop-blur-xl pb-16 lg:pb-safe pt-2 px-2 lg:px-4 lg:py-4">
             <div className="max-w-4xl mx-auto w-full flex flex-col lg:flex-row items-end lg:items-center gap-3 lg:gap-8 pb-3 lg:pb-0">
                 
                 {/* Bet Configuration Module */}
                 <div className="w-full lg:w-auto flex-1 min-w-0">
                     <BetStatus />
                 </div>
                 
                 {/* Action Buttons Module */}
                 <div className="w-full lg:w-auto flex-1 min-w-0">
                     <PredictionButtons />
                 </div>

             </div>
          </div>
      </div>

      {/* Slide-over Panels (History/Leaderboard) */}
      <SidePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        initialTab={activeTab}
      />

    </div>
  );
};
