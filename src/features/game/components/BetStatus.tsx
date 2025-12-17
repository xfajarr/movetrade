
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../../player/store/playerStore';
import { BalanceDisplay } from '../../player/components/BalanceDisplay';

export const BetStatus: React.FC = () => {
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
            // Logic to close only on NEW bet addition could be complex, 
            // but simply closing when activeBets changes length is decent
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

    return (
        <div className="w-full max-w-md mx-auto px-4 mb-2 relative">

            {/* HEADER: Balance + Bet Toggle */}
            <div className="flex justify-between items-center mb-2">
                <BalanceDisplay compact />

                <div className="flex items-center gap-2">
                    {activeBets.length > 0 && (
                        <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-game-accent"></div>
                            <span className="text-[10px] font-bold text-game-accent uppercase">{activeBets.length} Active</span>
                        </div>
                    )}

                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/10 cursor-pointer"
                    >
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mr-1">BET</span>
                        <span className="text-game-accent font-mono font-bold text-sm">${betAmount}</span>
                        <span className="text-gray-600 text-xs">|</span>
                        <span className="text-purple-400 font-mono font-bold text-sm">{leverage}x</span>
                        <span className="text-gray-600 text-xs">|</span>
                        <span className="text-cyan-400 font-mono font-bold text-sm">10s</span>

                        <svg
                            className={`w-3 h-3 text-gray-400 ml-1 transition-transform duration-200 ${showConfig ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>

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

                {/* Timeframe Display (Fixed at 10s) */}
                <div className="mb-4">
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Race Duration</span>
                        <span className="text-cyan-400 font-bold">10s</span>
                    </div>
                </div>

                {/* Leverage Selector */}
                <div className="mb-4">
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
                <div className="pt-3 border-t border-white/5 space-y-1">
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
    );
};
