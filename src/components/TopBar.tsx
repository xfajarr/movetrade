

import React, { useState } from 'react';
import { useGameStore } from '../features/game/store/gameStore'; // Verify path if needed, but mainly we need MarketStore
import { useMarketStore } from '../features/market/store/marketStore';
import { Market } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { WalletButton } from './wallet/WalletButton';

interface TopBarProps {}

const ICONS: Record<Market, React.ReactNode> = {
  SOL: <img src="/solanaLogoMark.svg" alt="Solana" className="w-full h-full object-contain" />,
  BTC: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path d="M22.5 13.625C22.5 12.1875 21.4375 11.125 20.125 10.875V8.5H18.5V10.6875H17V8.5H15.375V10.5625H12.25V11.875H13.625C13.9375 11.875 14.125 12.0625 14.125 12.375V19.125C14.125 19.4375 13.9375 19.625 13.625 19.625H12.25V21H15.375V23H17V21.125H18.5V23H20.125V21C22.25 20.625 23.5 19.25 23.5 17.5C23.5 16.125 22.625 15.375 21.375 15.125C22.1875 14.8125 22.5 14.3125 22.5 13.625ZM18.5 12.5H16.375V11.875H18.5V12.5ZM19 18.5H16.375V17.5H19V18.5Z" fill="white"/>
    </svg>
  ),
  ETH: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16 6L8.5 18.5L16 26L23.5 18.5L16 6ZM16.5 16.5V9.5L21.5 17.5L16.5 16.5ZM15.5 16.5L10.5 17.5L15.5 9.5V16.5ZM16.5 18V23.5L21.5 18L16.5 18ZM15.5 23.5V18L10.5 18L15.5 23.5Z" fill="white"/>
    </svg>
  )
};

export const TopBar: React.FC<TopBarProps> = () => {
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const setMarket = useMarketStore((state) => state.setMarket);
  const price = useMarketStore((state) => state.currentPrice);
  const startPrice = useMarketStore((state) => state.startPrice);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const markets: Market[] = ['BTC', 'ETH', 'SOL'];
  
  const change = price - startPrice;
  const changePercent = (change / startPrice) * 100;
  const isUp = change >= 0;
  const changeColor = isUp ? 'text-[#00ff9d]' : 'text-[#ff0055]';

  return (
    <div className="flex items-center justify-between px-3 py-1 lg:px-4 lg:py-2 z-50 relative pointer-events-none">
      
      {/* Floating Glass Panel */}
      <div className="absolute inset-x-2 top-1 bottom-0 bg-[#050b14]/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl skew-x-[-1deg] pointer-events-auto overflow-hidden">
         {/* Top Accent Line */}
         <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content Container (On top of glass) */}
      <div className="relative w-full flex items-center justify-between pointer-events-auto pl-3 pr-2 py-1.5">

          {/* LEFT: Market Selector (Tech Chip) */}
          <div className="relative w-[30%] lg:w-auto min-w-0 flex items-center">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="relative">
                  <div className="absolute inset-0 bg-game-accent/20 blur-sm rounded-full group-hover:bg-game-accent/40 transition-colors" />
                  <div className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                    {ICONS[selectedMarket]}
                  </div>
              </div>
              
              <div className="flex flex-col items-start min-w-0 leading-tight">
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest font-mono group-hover:text-game-accent transition-colors">Market</span>
                <div className="flex items-center gap-1">
                    <span className="font-black text-white text-base md:text-lg uppercase tracking-tighter truncate group-hover:text-white transition-colors drop-shadow-md">
                    {selectedMarket}
                    </span>
                    <svg 
                    className={`w-2.5 h-2.5 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-game-accent' : ''}`} 
                    viewBox="0 0 24 24" fill="currentColor"
                    >
                    <path d="M7 10l5 5 5-5z" />
                    </svg>
                </div>
              </div>
            </button>

            {/* Dropdown (Styled) */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div 
                  className={`
                    absolute top-full left-0 mt-2 w-48 bg-[#0a0f18] border border-white/10 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden 
                    transition-all duration-200 origin-top-left animate-in fade-in slide-in-from-top-1
                  `}
                >
                  <div className="p-1">
                    {markets.map((market) => (
                      <button
                        key={market}
                        onClick={() => {
                          setMarket(market);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 transition-all text-left group
                          ${selectedMarket === market ? 'bg-white/5 border border-white/5' : 'border border-transparent'}
                        `}
                      >
                        <div className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${selectedMarket === market ? 'grayscale-0' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                          {ICONS[market]}
                        </div>
                        <span className={`font-bold font-mono text-sm ${selectedMarket === market ? 'text-game-accent' : 'text-gray-400 group-hover:text-white'}`}>
                          {market}
                        </span>
                        {selectedMarket === market && (
                          <div className="ml-auto flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-game-accent shadow-[0_0_5px_#00f0ff] animate-pulse" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CENTER: Price Display (Fixed Spacing & Animation) */}
          <div className="flex flex-col items-center justify-center flex-1 w-[40%] min-w-0 mx-2">
            <div className="flex items-baseline gap-1">
                <span className={`text-xs font-bold transition-all duration-300 ${isUp ? 'text-[#00ff9d]' : 'text-[#ff0055]'}`}>
                     {isUp ? '▲' : '▼'}
                </span>
                
                {/* Price Number with Pop Animation */}
                <span key={price} className="font-black text-white text-xl lg:text-3xl tracking-tight tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] animate-in fade-in zoom-in-50 duration-200">
                    {formatPrice(price).replace('$', '')}
                </span>
                
                {/* Currency Symbol with Spacing */}
                <span className="text-sm lg:text-xl text-gray-600 font-normal ml-0.5">$</span>
            </div>
            
            <div className={`mt-0.5 text-[9px] md:text-xs font-mono font-bold tracking-wider ${changeColor} bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1.5`}>
                 <span>{isUp ? '+' : ''}{changePercent.toFixed(2)}%</span>
                 <span className="text-gray-600 text-[8px] uppercase border-l border-white/10 pl-1.5">24h</span>
            </div>
          </div>

          {/* RIGHT: Actions (Wallet + Tools) */}
          <div className="flex items-center justify-end gap-2 w-[30%] lg:w-auto min-w-0">
             <div className="hidden sm:flex scale-90 origin-right">
                 <WalletButton />
             </div>
             
             {/* Mobile Wallet Icon Only (if needed, or reuse WalletButton responsive logic) */}


          </div>
      </div>
    </div>
  );
};

