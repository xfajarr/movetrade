import React, { useEffect } from 'react';
import { useSocialData } from '../features/social/hooks/useSocialData';

export const StatsPage: React.FC = () => {
  const { leaderboard } = useSocialData();
  
  // Sort leaderboard by wins (descending)
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.wins - a.wins);
  const top3 = sortedLeaderboard.slice(0, 3);
  const rest = sortedLeaderboard.slice(3);

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col p-4 pb-24 overflow-hidden animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex flex-col gap-1 mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
             <div className="h-0.5 bg-game-accent w-8 shadow-[0_0_10px_#00f0ff]" />
             <h4 className="text-game-accent font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-shadow-glow">RANKINGS</h4>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-xl leading-none">
            GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-accent to-blue-500">LEADERBOARD</span>
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-3 gap-3 items-end mb-8">
                {/* 2nd Place */}
                {top3[1] && (
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 order-1 transform translate-y-4">
                        <div className="text-2xl">🥈</div>
                        <div className="text-xs font-bold text-gray-300 truncate w-full text-center">{top3[1].username}</div>
                        <div className="text-lg font-black text-white">{top3[1].wins} <span className="text-[10px] font-normal text-gray-500">WINS</span></div>
                    </div>
                )}
                
                {/* 1st Place */}
                {top3[0] && (
                    <div className="bg-gradient-to-b from-game-accent/20 to-[#0f172a] backdrop-blur-xl border border-game-accent/50 rounded-xl p-4 flex flex-col items-center gap-2 order-2 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative z-10">
                        <div className="absolute -top-4 text-4xl drop-shadow-lg">👑</div>
                        <div className="mt-4 text-sm font-black text-game-accent truncate w-full text-center">{top3[0].username}</div>
                        <div className="text-2xl font-black text-white">{top3[0].wins} <span className="text-xs font-normal text-gray-400">WINS</span></div>
                    </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 order-3 transform translate-y-6">
                        <div className="text-2xl">🥉</div>
                        <div className="text-xs font-bold text-[#cd7f32] truncate w-full text-center">{top3[2].username}</div>
                        <div className="text-lg font-black text-white">{top3[2].wins} <span className="text-[10px] font-normal text-gray-500">WINS</span></div>
                    </div>
                )}
            </div>

            {/* Rest of the List */}
            <div className="bg-[#0f172a]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20 text-[10px] uppercase text-gray-500 font-mono">
                        <tr>
                            <th className="p-4 font-normal">Rank</th>
                            <th className="p-4 font-normal">Operator</th>
                            <th className="p-4 font-normal text-right">Wins</th>
                            <th className="p-4 font-normal text-right">Win Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {rest.map((user, index) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-400 font-bold">#{index + 4}</td>
                                <td className="p-4 font-bold text-white">{user.username}</td>
                                <td className="p-4 text-right text-gray-300">{user.wins}</td>
                                <td className="p-4 text-right text-game-accent">
                                    {((user.wins / (user.total_races || 1)) * 100).toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
  );
};
