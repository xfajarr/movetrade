
import React, { useState } from 'react';
import { useSocialStore } from '../features/social/store/socialStore';

export const Tournaments: React.FC = () => {
  const tournaments = useSocialStore((state) => state.tournaments);
  const joinTournament = useSocialStore((state) => state.joinTournament);
  const [open, setOpen] = useState(true);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const handleJoin = (id: string) => {
    joinTournament(id);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className={`flex flex-col min-h-0 ${open ? 'h-full' : 'h-auto'}`}>
      {/* Toggle Header */}
      <div className="px-4">
        <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-200">Tournaments</span>
            <span className="text-[10px] font-mono bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{tournaments.length}</span>
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
            <h3 className="text-purple-400 font-bold uppercase tracking-widest text-lg">Active Events</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
            {tournaments.map((t) => (
              <div 
                key={t.id}
                className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
              >
                {/* Decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${t.status === 'LIVE' ? 'from-game-accent/20' : 'from-purple-500/20'} to-transparent blur-2xl -mr-10 -mt-10`} />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {t.status === 'LIVE' && (
                        <span className="animate-pulse flex h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === 'LIVE' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white italic">{t.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Prize Pool</div>
                    <div className="text-2xl font-black text-[#FFD700] drop-shadow-sm">
                      ${(t.prizePool / 1000).toLocaleString()}k
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                  <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Ending In</div>
                    <div className="font-mono font-bold text-white">{formatTime(t.endsIn - Date.now())}</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5">
                     <div className="text-[10px] text-gray-500 uppercase">Players</div>
                     <div className="font-mono font-bold text-white">{t.participants}</div>
                  </div>
                </div>

                {t.userRank !== undefined ? (
                   <div className="flex flex-col gap-2 bg-game-accent/5 border border-game-accent/30 rounded-lg p-3 relative overflow-hidden">
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <span className="text-[10px] text-game-accent font-bold uppercase block mb-1">Your Rank</span>
                          <span className="text-2xl font-black text-white">#{t.userRank}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Tournament Score</span>
                          <span className="text-xl font-mono font-bold text-game-up">+${(t.userScore || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar Mockup */}
                      <div className="w-full h-1 bg-black/40 rounded-full mt-2 overflow-hidden">
                         <div className="h-full bg-game-accent w-[35%] animate-pulse" />
                      </div>
                      <div className="text-[10px] text-center text-gray-500 mt-1">Place bets to climb the leaderboard!</div>
                   </div>
                ) : (
                  <button 
                    onClick={() => handleJoin(t.id)}
                    disabled={t.status === 'ENDED'}
                    className={`
                      w-full py-3 font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg active:scale-95 active:shadow-none
                      ${t.status === 'ENDED' 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'}
                    `}
                  >
                    {t.status === 'UPCOMING' ? 'Pre-Register' : 'Join Tournament'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
