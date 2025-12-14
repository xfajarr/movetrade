
import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Market } from '../types';
import { formatPrice } from '../utils/formatPrice';

interface TopBarProps {
  onToggleHistory: () => void;
  onToggleLeaderboard: () => void;
}

const ICONS: Record<Market, React.ReactNode> = {
  SOL: (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.333 24.666L21.333 24.666L26.666 20L10.666 20L5.333 24.666Z" fill="url(#paint0_linear)"/>
      <path d="M5.333 12L21.333 12L26.666 7.33333L10.666 7.33333L5.333 12Z" fill="url(#paint1_linear)"/>
      <path d="M10.666 18.3333L26.666 18.3333L21.333 13.6667L5.33301 13.6667L10.666 18.3333Z" fill="url(#paint2_linear)"/>
      <defs>
        <linearGradient id="paint0_linear" x1="22.8" y1="20.8" x2="8.8" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="paint1_linear" x1="22.8" y1="8.13333" x2="8.8" y2="11.3333" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="paint2_linear" x1="9.19967" y1="17.5333" x2="23.1997" y2="14.3333" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
    </svg>
  ),
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

export const TopBar: React.FC<TopBarProps> = ({ onToggleHistory, onToggleLeaderboard }) => {
  const selectedMarket = useGameStore((state) => state.selectedMarket);
  const setMarket = useGameStore((state) => state.setMarket);
  const price = useGameStore((state) => state.currentPrice);
  const startPrice = useGameStore((state) => state.startPrice);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const markets: Market[] = ['BTC', 'ETH', 'SOL'];
  
  const change = price - startPrice;
  const changePercent = (change / startPrice) * 100;
  const isUp = change >= 0;
  const changeColor = isUp ? 'text-[#00ff9d]' : 'text-[#ff0055]';

  return (
    <div className="flex items-center justify-between px-3 py-2.5 lg:px-4 lg:py-2 bg-[#050b14] border-b border-white/5 relative z-50">
      
      {/* SECTION 1: MARKET SELECTOR */}
      <div className="relative w-[32%] lg:w-[28%] min-w-0">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 relative group cursor-pointer w-full focus:outline-none"
        >
          <div className="w-8 h-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
            {ICONS[selectedMarket]}
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-black text-white text-lg md:text-xl uppercase tracking-tighter truncate group-hover:text-game-accent transition-colors">
              {selectedMarket}-USD
            </span>
            <svg 
              className={`w-3 h-3 text-gray-500 mt-0.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-game-accent' : ''}`} 
              viewBox="0 0 24 24" fill="currentColor"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </button>

        {/* Backdrop to close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
        )}

        {/* Custom Dropdown Menu */}
        <div 
          className={`
            absolute top-full left-0 mt-3 w-48 bg-[#0a0f18] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden 
            transition-all duration-200 origin-top-left
            ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
          `}
        >
          <div className="py-1">
            {markets.map((market) => (
              <button
                key={market}
                onClick={() => {
                  setMarket(market);
                  setIsDropdownOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group
                  ${selectedMarket === market ? 'bg-white/5' : ''}
                `}
              >
                <div className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${selectedMarket === market ? 'grayscale-0' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                  {ICONS[market]}
                </div>
                <span className={`font-bold font-mono ${selectedMarket === market ? 'text-game-accent' : 'text-gray-300 group-hover:text-white'}`}>
                  {market}-USD
                </span>
                {selectedMarket === market && (
                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-game-accent shadow-[0_0_5px_#00f0ff]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-px h-7 lg:h-8 bg-white/10 mx-2 lg:mx-3" />

      {/* SECTION 2: PRICE */}
      <div className="flex items-center justify-center gap-2 flex-1 w-[36%] lg:w-[38%] min-w-0">
        <div className={`text-lg md:text-xl transition-all duration-300 ${isUp ? 'text-[#00ff9d] translate-y-[-2px]' : 'text-[#ff0055] translate-y-[2px]'}`}>
          {isUp ? '▲' : '▼'}
        </div>
        <div className="font-black text-white text-xl lg:text-2xl xl:text-3xl tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          ${formatPrice(price)}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-px h-7 lg:h-8 bg-white/10 mx-2 lg:mx-3" />

      {/* SECTION 3: CHANGE % & MENU */}
      <div className="flex items-center justify-end gap-2.5 w-[32%] lg:w-[34%] min-w-0">
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Change 24h</span>
          <span className={`font-bold text-xs md:text-sm lg:text-base tabular-nums ${changeColor}`}>
            {isUp ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
        
        <div className="flex gap-2">
          {/* Tournament/Leaderboard Button */}
          <button 
            onClick={onToggleLeaderboard}
            className="w-9 h-9 lg:w-9 lg:h-9 flex-shrink-0 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-game-accent transition-all duration-200 border border-white/5 shadow-lg active:scale-95 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
               <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
               <path d="M4 22h16"></path>
               <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
               <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
               <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
             </svg>
          </button>

          {/* History Button */}
          <button 
            onClick={onToggleHistory}
            className="w-9 h-9 lg:w-9 lg:h-9 flex-shrink-0 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#FFD700] transition-all duration-200 border border-white/5 shadow-lg active:scale-95 hover:shadow-[0_0_10px_rgba(255,215,0,0.3)]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10"></circle>
               <polyline points="12 6 12 12 16 14"></polyline>
             </svg>
          </button>
        </div>
      </div>

    </div>
  );
};
