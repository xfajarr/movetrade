import React, { useEffect, useState } from 'react';
import { useGameStore } from '../features/game/store/gameStore';
// Timeframe fixed to 10s
import { BalanceDisplay } from './BalanceDisplay';

interface BetStatusProps {
  verticalMode?: boolean;
}

import { usePlayerStore } from '../features/player/store/playerStore';

export const BetStatus: React.FC<BetStatusProps> = ({ verticalMode = false }) => {
  const activeBets = useGameStore((state) => state.activeBets);

  // Config state
  const betAmount = useGameStore((state) => state.betAmount);
  const setBetAmount = useGameStore((state) => state.setBetAmount);
  const leverage = useGameStore((state) => state.leverage);
  const setLeverage = useGameStore((state) => state.setLeverage);

  const balance = usePlayerStore((state) => state.balance);

  const [showConfig, setShowConfig] = useState(false);
  const [showLeverage, setShowLeverage] = useState(false);

  // Auto-close config when a NEW bet starts (optional, keeps UI clean)
  useEffect(() => {
    if (activeBets.length > 0) {
      setShowConfig(false);
    }
  }, [activeBets.length]);

  // Calculations for summary
  const fee = betAmount * 0.0001; // 0.01% fee
  const profitRate = 0.95 + (leverage * 0.05);
  const potentialProfit = betAmount * profitRate;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setBetAmount(Math.max(0, val));
    } else if (e.target.value === '') {
      setBetAmount(0);
    }
  };

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(10, betAmount + delta);
    if (newAmount <= balance) {
      setBetAmount(newAmount);
    }
  };

  const formatDurationLabel = (ms: number) => `${Math.round(ms / 1000)}s`;

  const containerClass = verticalMode
    ? 'w-full mb-0 relative z-20'
    : 'w-full max-w-md lg:max-w-xl mx-auto px-4 lg:px-0 mb-2 relative z-50';

  return (
    <div className={containerClass}>

      {/* DESKTOP: Unified Control Bar (Horizontal) */}
      {!verticalMode && (
        <div className="hidden lg:flex items-center justify-between bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md w-full max-w-4xl mx-auto">
          {/* ... (Horizontal layout content - kept for reference if needed, but we are moving to vertical) ... */}
          {/* Actually, since we are switching to 3-column, this horizontal bar might not be used on desktop anymore.
              But let's keep it conditional just in case.
              Wait, the prompt implies a complete switch.
              However, I'll implement the Vertical Mode here. */}
           <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Balance</span>
            <div className="text-2xl font-mono font-black text-white">
              ${balance.toLocaleString()}
            </div>
          </div>
          {/* ... other horizontal items ... */}
        </div>
      )}

      {/* DESKTOP: Vertical Sidebar Mode */}
      {verticalMode && (
        <div className="flex flex-col gap-3 w-full bg-black/20 border border-white/10 rounded-xl p-2.5 shadow-sm backdrop-blur-sm">
          
          {/* 1. Enter Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Enter Amount</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 12h.01"/></svg>
                <span>${balance.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-[#050b14] rounded-lg p-2 border border-white/10 flex items-center gap-1.5">
               <button
                 onClick={() => adjustAmount(-100)}
                 className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
               >-</button>
               <div className="flex-1 text-center">
                 <input
                    type="number"
                    value={betAmount === 0 ? '' : betAmount}
                    onChange={handleAmountChange}
                    className="w-full bg-transparent text-center text-base font-mono font-bold text-white focus:outline-none"
                    placeholder="$0"
                 />
               </div>
               <button
                 onClick={() => adjustAmount(100)}
                 className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
               >+</button>
            </div>

            {/* Quick Percentages */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => setBetAmount(Math.floor(balance * (pct / 100)))}
                  className="py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white transition-colors border border-white/5"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Race Duration (Fixed) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Race Duration</span>
            <div className="bg-white/5 border border-white/5 rounded-lg py-1.5 text-center">
              <span className="text-game-accent font-bold">10 seconds</span>
            </div>
          </div>

          {/* 3. Set Leverage */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Set Leverage</span>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map(lev => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`
                    py-1.5 rounded-lg text-[11px] font-bold transition-all border
                    ${leverage === lev
                      ? 'bg-game-accent/10 border-game-accent text-game-accent shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* 4. Est. Payout (Info) */}
          <div className="space-y-2">
             <div className="flex justify-between text-xs">
               <span className="text-gray-500 font-bold">Est. Payout</span>
               <span className="text-game-up font-bold font-mono">${potentialProfit.toFixed(0)}</span>
             </div>
             <div className="flex justify-between text-xs">
               <span className="text-gray-500 font-bold">Fee (0.01%)</span>
               <span className="text-gray-300 font-mono">${fee.toFixed(2)}</span>
             </div>
          </div>

        </div>
      )}

      {/* MOBILE: Cyberpunk Cockpit HUD */}
      <div className="lg:hidden w-full">
        {/* Main Data Bar */}
        <div className="relative flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-1 mx-2 mb-2 skew-x-[-12deg] shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden group">
            
            {/* Tech Glow Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

            <div className="flex items-center justify-between w-full px-4 py-1 skew-x-[12deg]">
                {/* Balance */}
                <div className="flex flex-col items-center min-w-[30%] border-r border-white/10 pr-2">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest font-mono mb-0.5">Balance</span>
                    <span className="text-sm font-black text-white tracking-tight drop-shadow-md">${balance.toLocaleString()}</span>
                </div>

                {/* Bet Trigger */}
                <button 
                    onClick={() => setShowConfig(!showConfig)}
                    className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest font-mono mb-0.5 animate-pulse">Wager</span>
                    <div className="flex items-center gap-1 bg-white/5 px-3 py-0.5 rounded skew-x-[-6deg] border border-white/10">
                        <span className="text-base font-black text-yellow-400 skew-x-[6deg] drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">${betAmount}</span>
                    </div>
                </button>

                {/* Leverage Trigger */}
                <button 
                    onClick={() => setShowLeverage(!showLeverage)}
                    className="flex flex-col items-center min-w-[25%] border-l border-white/10 pl-2 active:scale-95 transition-transform"
                >
                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-mono mb-0.5">Lev</span>
                    <span className="text-sm font-black text-purple-300 tracking-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">{leverage}x</span>
                </button>
            </div>
        </div>

        {/* Live Indicator (Floating) */}
        {activeBets.length > 0 && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-green-500/10 border border-green-500/50 rounded px-2 py-0.5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <span className="text-[9px] font-bold text-green-400 font-mono uppercase tracking-wider shadow-green-500/50">Live</span>
            </div>
        )}


        {/* Configuration Popup */}
        <div
          className={`
            absolute bottom-full left-4 right-4 mb-4 bg-game-panel rounded-xl p-4 border border-white/10 shadow-2xl z-50 
            transition-all duration-300 ease-out origin-bottom transform
            ${showConfig ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
          `}
        >

          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configure Bet</span>
            <button
              onClick={() => setShowConfig(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Amount Selector */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Amount</span>

            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/10 shadow-inner">
              <button
                onClick={() => adjustAmount(-10)}
                disabled={betAmount <= 10}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 rounded text-game-accent font-bold transition-colors disabled:opacity-30"
              >
                -
              </button>

              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono pointer-events-none">$</span>
                <input
                  type="number"
                  value={betAmount === 0 ? '' : betAmount}
                  onChange={handleAmountChange}
                  className={`
                    w-24 bg-transparent text-right pr-2 py-1 text-lg font-mono font-bold focus:outline-none placeholder-gray-700
                    ${betAmount > balance ? 'text-red-500' : 'text-white'}
                  `}
                  placeholder="0"
                />
              </div>

              <button
                onClick={() => adjustAmount(10)}
                disabled={betAmount >= balance}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/20 rounded text-game-accent font-bold transition-colors disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Race Duration (Fixed) */}
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Race Duration</span>
              <span className="text-game-accent font-bold">10s</span>
            </div>
          </div>

          {/* Leverage Selector */}
          <div className="mb-3">
            <div
              onClick={() => setShowLeverage(!showLeverage)}
              className="flex justify-between items-center cursor-pointer group bg-black/20 p-2 rounded-lg border border-white/5 hover:bg-black/30 transition-colors"
            >
              <span className="text-xs text-gray-400 font-mono uppercase tracking-wider group-hover:text-white transition-colors">Leverage</span>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">{leverage}x</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showLeverage ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Leverage Options (Animated expand) */}
            <div className={`overflow-hidden transition-all duration-300 ${showLeverage ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[5, 10, 20, 50, 100].map(lev => (
                  <button
                    key={lev}
                    onClick={() => { setLeverage(lev); setShowLeverage(false); }}
                    className={`
                      px-3 py-1.5 text-xs font-bold rounded-md transition-all font-mono flex-1 whitespace-nowrap
                      ${leverage === lev
                        ? 'bg-purple-600 text-white shadow-[0_0_10px_#a855f7] border border-purple-400'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'}
                    `}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-2.5 border-t border-white/5 space-y-1">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-500">Fee</span>
              <span className="text-white">${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-500">Est. Payout</span>
              <span className="text-game-up font-bold">${potentialProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
