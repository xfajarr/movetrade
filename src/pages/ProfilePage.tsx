import React from 'react';
import { usePlayerStore } from '../features/player/store/playerStore';

export const ProfilePage: React.FC = () => {
  const { balance, history, isWalletMode } = usePlayerStore();

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col p-4 pb-24 overflow-hidden animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex flex-col gap-1 mb-6 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
             <div className="h-0.5 bg-game-accent w-8 shadow-[0_0_10px_#00f0ff]" />
             <h4 className="text-game-accent font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-shadow-glow">OPERATOR</h4>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-xl leading-none">
            PILOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-accent to-blue-500">PROFILE</span>
          </h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            
            {/* ID Card / Balance */}
            <div className="bg-gradient-to-br from-[#0f172a] to-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-50">
                    <svg className="w-16 h-16 text-white/5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                 </div>
                 
                 <div className="relative z-10 flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">👤</div>
                        <div>
                             <h3 className="text-lg font-bold text-white uppercase tracking-wider">Operator</h3>
                             <p className="text-xs text-game-accent font-mono bg-game-accent/10 px-2 py-0.5 rounded inline-block">ID: 0x82...39A</p>
                        </div>
                     </div>

                     <div className="mt-2 p-4 bg-black/40 rounded-xl border border-white/5">
                         <div className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-1">Total Balance</div>
                         <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                             {balance.toLocaleString()} <span className="text-sm font-normal text-game-accent">MOVE</span>
                         </div>
                         {isWalletMode && <div className="text-[10px] text-green-400 mt-1">● Wallet Connected</div>}
                     </div>
                 </div>
            </div>

            {/* History Section */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Race History</h3>
                
                {history.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <p className="text-gray-500 font-mono text-xs">NO RACE DATA LOGGED</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((bet, idx) => (
                           <div key={idx} className="bg-[#0f172a]/60 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white uppercase">{bet.prediction.toUpperCase()} Prediction</span>
                                    <span className="text-[10px] text-gray-500 font-mono">{new Date(bet.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className={`text-sm font-black ${bet.result === 'win' ? 'text-green-400' : bet.result === 'loss' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {bet.result ? bet.result.toUpperCase() : 'PENDING'}
                                </div>
                           </div> 
                        ))}
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};
