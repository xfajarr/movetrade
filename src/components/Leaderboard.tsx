
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const Leaderboard: React.FC = () => {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const [open, setOpen] = useState(true);

  return (
    <div className={`flex flex-col min-h-0 ${open ? 'h-full' : 'h-auto'}`}>
      {/* Toggle Header */}
      <div className="px-4">
        <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-200">Leaderboard</span>
            <span className="text-[10px] font-mono bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{leaderboard.length}</span>
          </div>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            {open ? 'Hide' : 'Show'}
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`
          overflow-hidden transition-[max-height] duration-300 ease-in-out
          ${open ? 'max-h-[2000px]' : 'max-h-0'}
        `}
      >
        <div
          className={`
            flex flex-col h-full px-4 pb-10
            transition-all duration-300 ease-out
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
          `}
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-game-accent font-bold uppercase tracking-widest text-lg">Global Rankings</h3>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
            {/* Header */}
            <div className="flex text-[10px] text-gray-500 uppercase tracking-wider font-bold px-4 mb-2">
              <div className="w-8 text-center">#</div>
              <div className="flex-1">Player</div>
              <div className="w-20 text-right">Profit</div>
              <div className="w-12 text-right">Win%</div>
            </div>

            {leaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`
                  flex items-center px-4 py-3 rounded-xl border
                  ${entry.isCurrentUser 
                    ? 'bg-game-accent/10 border-game-accent/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'}
                `}
              >
                {/* Rank */}
                <div className={`
              w-8 text-center font-black text-lg mr-2
              ${entry.rank === 1 ? 'text-[#FFD700]' : 
                entry.rank === 2 ? 'text-[#C0C0C0]' : 
                entry.rank === 3 ? 'text-[#CD7F32]' : 'text-gray-500'}
            `}>
                  {entry.rank}
                </div>

                {/* User */}
                <div className="flex-1 flex flex-col">
                  <span className={`font-bold ${entry.isCurrentUser ? 'text-game-accent' : 'text-white'}`}>
                    {entry.username}
                  </span>
                  {entry.rank <= 3 && (
                    <span className="text-[10px] text-[#FFD700] uppercase tracking-wider font-bold">Top Trader</span>
                  )}
                </div>

                {/* Score */}
                <div className="w-20 text-right font-mono font-bold text-game-up">
                  ${(entry.score / 1000).toFixed(1)}k
                </div>

                {/* Win Rate */}
                <div className="w-12 text-right font-mono text-gray-400 text-xs">
                  {entry.winRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
