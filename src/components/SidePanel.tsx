
import React, { useState, useEffect } from 'react';
import { HistoryList } from './HistoryList';
import { Leaderboard } from './Leaderboard';
import { Tournaments } from './Tournaments';

type PanelTab = 'history' | 'leaderboard' | 'tournaments';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PanelTab;
  desktopMode?: boolean; // New prop for desktop mode
}

export const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, initialTab = 'history', desktopMode = false }) => {
  const [activeTab, setActiveTab] = useState<PanelTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Desktop mode: static sidebar, no backdrop, no close button
  if (desktopMode) {
    return (
      <div className="h-full flex flex-col bg-[#0a1220]">
        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-6 pb-2 border-b border-white/5 gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-[#FFD700] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'leaderboard' ? 'border-game-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tournaments' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Tournaments
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden pt-6 relative">
          {activeTab === 'history' && <HistoryList />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'tournaments' && <Tournaments />}
        </div>
      </div>
    );
  }

  // Mobile mode: drawer overlay
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-[90%] md:w-[400px] bg-[#0a0f18] z-[70] shadow-2xl border-l border-white/10 
        transition-transform duration-300 transform flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 z-20 hover:bg-white/5 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-12 pb-2 border-b border-white/5 gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-[#FFD700] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'leaderboard' ? 'border-game-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tournaments' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Tournaments
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden pt-6 relative">
          {activeTab === 'history' && <HistoryList />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'tournaments' && <Tournaments />}
        </div>
      </div>
    </>
  );
};
