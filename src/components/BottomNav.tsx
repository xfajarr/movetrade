/**
 * Mobile Bottom Navigation
 * 
 * Fixed bottom nav bar for mobile users
 */

import React from 'react';

interface BottomNavProps {
  activePage: 'tournament' | 'race' | 'stats' | 'profile';
  onNavigate: (page: 'tournament' | 'race' | 'stats' | 'profile') => void;
  // Kept for backward compatibility if needed, but intended to be unused
  onMenuClick?: () => void; 
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  
  const getButtonClass = (page: string) => `
    flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation flex-1
    ${activePage === page ? 'text-game-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : 'text-gray-500 active:text-gray-300'}
  `;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#050b14]/90 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-4">
        
        {/* Home/Lobby */}
        <button
          onClick={() => onNavigate('tournament')}
          className={getButtonClass('tournament')}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[9px] font-bold tracking-wide">LOBBY</span>
        </button>

        {/* Race (Active) */}
        <button
            onClick={() => onNavigate('race')} 
            className={getButtonClass('race')}
        >
          <div className="relative">
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activePage==='race'?2.5:2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {activePage === 'race' && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-game-accent rounded-full animate-ping" />}
          </div>
          <span className="text-[9px] font-bold tracking-wide">RACE</span>
        </button>

        {/* Stats */}
        <button 
            onClick={() => onNavigate('stats')}
            className={getButtonClass('stats')}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[9px] font-bold tracking-wide">RANK</span>
        </button>

        {/* Profile */}
        <button 
            onClick={() => onNavigate('profile')}
            className={getButtonClass('profile')}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[9px] font-bold tracking-wide">PROFILE</span>
        </button>
      </div>
    </div>
  );
};
