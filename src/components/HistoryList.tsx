import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Direction, Bet } from '../types';

interface ActiveBetItemProps {
  bet: Bet;
  currentPrice: number;
}

// Component to render a single active bet item with live timer
const ActiveBetItem: React.FC<ActiveBetItemProps> = ({ bet, currentPrice }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, bet.endTime - Date.now()));
    }, 100);
    return () => clearInterval(timer);
  }, [bet.endTime]);

  const isWinning = (bet.direction === Direction.UP && currentPrice > bet.entryPrice) ||
                    (bet.direction === Direction.DOWN && currentPrice < bet.entryPrice);
  const totalDuration = Math.max(1, bet.endTime - bet.startTime);
  const progress = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  return (
    <div className={`
      flex items-center justify-between bg-white/5 p-4 rounded-xl border-l-4 
      ${isWinning ? 'border-game-up bg-game-up/5' : 'border-game-down bg-game-down/5'}
      mb-2 relative overflow-hidden
    `}>
       {/* Background Progress hint */}
       <div className="absolute bottom-0 left-0 h-0.5 bg-white/20 transition-all duration-1000 ease-linear" 
            style={{ width: `${progress}%` }} 
       />

       <div className="flex items-center gap-4">
         <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-lg animate-pulse
            ${bet.direction === Direction.UP ? 'bg-game-up text-black' : 'bg-game-down text-white'}
          `}>
            {bet.direction === Direction.UP ? '▲' : '▼'}
         </div>
         <div className="flex flex-col">
           <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
             {(timeLeft / 1000).toFixed(1)}s
           </span>
           <span className="text-sm font-bold text-white">
              ${bet.amount} <span className="text-xs text-purple-400">x{bet.leverage}</span>
           </span>
         </div>
       </div>

       <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 font-mono">ENTRY: {bet.entryPrice.toFixed(2)}</span>
          <span className={`font-bold ${isWinning ? 'text-game-up' : 'text-game-down'}`}>
             {isWinning ? 'WINNING' : 'LOSING'}
          </span>
       </div>
    </div>
  );
};

export const HistoryList: React.FC = () => {
  const history = useGameStore((state) => state.player.history);
  const activeBets = useGameStore((state) => state.player.activeBets);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const [open, setOpen] = useState(true);

  const hasActivity = history.length > 0 || activeBets.length > 0;

  return (
    <div className={`flex flex-col min-h-0 ${open ? 'h-full' : 'h-auto'}`}>
      {/* Toggle Header */}
      <div className="px-4">
        <div className="flex items-center justify-between rounded-2xl bg-[#0d1526] border border-white/5 px-4 py-3 shadow-inner shadow-black/30">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black uppercase tracking-[0.18em] text-gray-100">History</span>
            <span className="text-[10px] font-mono bg-white/10 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
              {history.length}
            </span>
            {activeBets.length > 0 && (
              <span className="text-[10px] font-mono bg-game-accent/15 text-game-accent px-2 py-0.5 rounded-full flex items-center gap-1 border border-game-accent/30">
                <span className="w-1.5 h-1.5 rounded-full bg-game-accent animate-pulse" />
                {activeBets.length} live
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-gray-200 hover:text-white transition-colors"
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

      {/* Animated Content */}
      <div
        className={`
          overflow-hidden transition-[max-height] duration-300 ease-in-out
          ${open ? 'max-h-[2000px]' : 'max-h-0'}
        `}
      >
        <div
          className={`
            flex flex-col h-full relative px-4
            transition-all duration-300 ease-out
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}
          `}
        >
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(-20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .history-item-enter {
              animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>

          {!hasActivity && (
            <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm px-4 text-center">
              No betting activity yet.
            </div>
          )}

          {hasActivity && (
            <>
              {/* ACTIVE BETS SECTION */}
              {activeBets.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3 px-2">
                    <h3 className="text-game-accent font-bold uppercase tracking-widest text-sm animate-pulse">Live Positions</h3>
                    <span className="text-xs font-bold text-black bg-game-accent px-2 py-0.5 rounded-full">{activeBets.length}</span>
                  </div>
                  <div className="space-y-2">
                    {activeBets.map((bet) => (
                      <ActiveBetItem key={bet.id} bet={bet} currentPrice={currentPrice} />
                    ))}
                  </div>
                  <div className="my-4 border-t border-dashed border-white/10" />
                </div>
              )}

              {/* HISTORY SECTION */}
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-gray-100 font-black uppercase tracking-[0.18em] text-xs">History</h3>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{history.length}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">%</span>
              </div>

              <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar pb-10">
                {history.map((bet, index) => (
                  <div
                    key={bet.id}
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                    className={`
                      history-item-enter
                      flex items-center justify-between bg-[#0d1526] p-4 rounded-2xl border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                      hover:bg-white/5 transition-colors
                    `}
                  >
                    {/* Left: Direction & Time */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black shadow-[0_6px_14px_rgba(0,0,0,0.4)]
                ${bet.direction === Direction.UP ? 'bg-game-up text-black' : 'bg-game-down text-white'}
              `}
                      >
                        {bet.direction === Direction.UP ? '▲' : '▼'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-mono tracking-wide">
                          {new Date(bet.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-sm font-black text-gray-100">@ {bet.entryPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Right: Result */}
                    <div className="text-right">
                      <div
                        className={`font-black text-xl tracking-tight ${bet.result === 'WIN' ? 'text-game-up drop-shadow-sm' : 'text-game-down'}`}
                      >
                        {bet.result === 'WIN' ? `+$${bet.payout.toFixed(0)}` : `-$${bet.amount}`}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.24em]">{bet.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
