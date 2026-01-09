/**
 * Race Lobby - Game Menu
 * 
 * Sprint Mode (Active) vs Grand Race (Coming Soon)
 */

import React, { useState } from 'react';
import { useMarketStore } from '../features/market/store/marketStore';
import type { Market } from '../types';

type GameMode = 'sprint' | 'grandrace';

interface DriverInfo {
  market: Market;
  name: string;
  image: string;
  stats: {
    speed: number;
    handling: number;
    acceleration: number;
  };
}

const DRIVERS: DriverInfo[] = [
  {
    market: 'SOL',
    name: 'SOL Rider',
    image: '/motogp_1.png',
    stats: { speed: 95, handling: 88, acceleration: 92 }
  },
  {
    market: 'ETH',
    name: 'ETH Champion',
    image: '/motogp_blue_transparent.png',
    stats: { speed: 92, handling: 95, acceleration: 88 }
  },
  {
    market: 'BTC',
    name: 'BTC Legend',
    image: '/motogp_orange_transparent.png',
    stats: { speed: 98, handling: 85, acceleration: 95 }
  }
];

interface TournamentPageProps {
  onStartRace: () => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({ onStartRace }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('sprint');
  const [selectedDriver, setSelectedDriver] = useState<Market>('SOL');
  const setMarket = useMarketStore((state) => state.setMarket);

  const handleStartRace = () => {
    setMarket(selectedDriver);
    onStartRace();
  };

  const selectedDriverInfo = DRIVERS.find(d => d.market === selectedDriver);

  // Helper for rendering stat bars
  const renderStatBar = (label: string, value: number) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
        <span>{label}</span>
        <span className="text-game-accent">{value}%</span>
      </div>
      <div className="h-2 w-full bg-black/60 skew-x-[-15deg] p-0.5 rounded-sm border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-cyan-800 to-game-accent shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all duration-700 ease-out rounded-sm"
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-game-dark text-white overflow-y-auto pb-safe font-sans selection:bg-game-accent selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-game-accent/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="h-full w-full max-w-7xl mx-auto flex flex-col lg:block lg:pb-12">
        
        {/* Scrollable Main Content Area for Mobile */}
        <div className="flex-1 overflow-y-auto lg:overflow-visible no-scrollbar pb-32 lg:pb-0">
          
          <div className="px-4 py-4 lg:px-8 lg:py-8 flex flex-col gap-6 lg:gap-8">
            {/* Header */}
            <header className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-4 duration-700 shrink-0">
              <div className="flex items-center gap-2">
                 <div className="h-0.5 bg-game-accent w-8 shadow-[0_0_10px_#00f0ff]" />
                 <h4 className="text-game-accent font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-shadow-glow">Configuration</h4>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase text-white drop-shadow-xl leading-none">
                RACE <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-accent via-cyan-400 to-blue-500 animate-gradient-x">LOBBY</span>
              </h1>
              <p className="text-gray-400 font-mono text-xs max-w-lg border-l-2 border-game-accent/20 pl-3 py-0.5 hidden sm:block">
                Initialize race parameters. Select competition mode and driver configuration.
              </p>
            </header>

            {/* Desktop Split Layout Wrapper */}
            <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">
                
                {/* Left Column / Mobile Top: Game Mode Selection */}
                <section className="shrink-0 lg:w-1/3 flex flex-col gap-3">
                  <div className="flex items-center gap-2 lg:hidden px-1">
                      <div className="h-1 bg-game-accent w-4" />
                      <h2 className="text-xs font-bold uppercase tracking-wider font-sans text-gray-300">Select Mode</h2>
                  </div>
                  
                  {/* Mobile: Horizontal Scroll | Desktop: Vertical Stack */}
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 py-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-1 [&::-webkit-scrollbar]:hidden">
                    {/* Sprint Mode - ACTIVE */}
                    <button
                      onClick={() => setSelectedMode('sprint')}
                      className={`
                        snap-center min-w-[85vw] sm:min-w-[320px] lg:min-w-0 flex-1
                        relative overflow-hidden group rounded-2xl p-4 transition-all duration-300 border text-left
                        backdrop-blur-xl
                        ${selectedMode === 'sprint' 
                          ? 'bg-game-panel/80 border-game-accent shadow-[0_0_20px_rgba(0,240,255,0.1)] ring-1 ring-game-accent/50 lg:scale-[1.02]' 
                          : 'bg-game-panel/40 border-white/5 hover:border-game-accent/40 hover:bg-game-panel/60'
                        }
                      `}
                    >
                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                           <div className={`
                             w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg
                             ${selectedMode === 'sprint' ? 'bg-gradient-to-br from-game-accent to-blue-600 text-black shadow-game-accent/20' : 'bg-white/5 text-gray-500'}
                           `}>
                             ⚡
                           </div>
                           {selectedMode === 'sprint' && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-game-accent/10 border border-game-accent/30 rounded-full backdrop-blur-md">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-game-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-game-accent"></span>
                                  </span>
                                  <span className="text-[9px] font-bold text-game-accent tracking-widest">ONLINE</span>
                              </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg lg:text-xl font-black font-sans uppercase italic mb-0.5 tracking-wide">Sprint Mode</h3>
                          <p className="text-[10px] text-gray-400 font-mono">PvE Time Trial • 10s</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {['Rapid Fire', '10s Intervals'].map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] text-gray-300 font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Hover Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                    </button>

                    {/* Grand Race - COMING SOON */}
                    <div className="snap-center min-w-[85vw] sm:min-w-[320px] lg:min-w-0 flex-1 relative overflow-hidden rounded-2xl p-4 border border-white/5 bg-[#050b14]/60 backdrop-blur-sm grayscale opacity-80 cursor-not-allowed">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.01)_10px,rgba(255,255,255,0.01)_20px)]" />
                      <div className="absolute top-3 right-3">
                          <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                              <span className="text-[9px] font-bold text-gray-500 tracking-widest">COMING SOON</span>
                          </div>
                      </div>
                      <div className="relative z-10 flex flex-col gap-3 opacity-60">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl text-gray-500">
                            🏆
                          </div>
                          <div>
                            <h3 className="text-lg lg:text-xl font-black font-sans uppercase italic mb-0.5 tracking-wide text-gray-500">Grand Race</h3>
                            <p className="text-[10px] text-gray-600 font-mono">Multiplayer Tournament</p>
                          </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Right Column / Mobile Bottom: Driver Selection + Start Button */}
                <div className="lg:w-2/3 flex flex-col gap-4">
                  
                   {/* Driver Selection */}
                   {selectedMode === 'sprint' && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
                       <div className="flex items-center gap-2 mt-3 mb-3 px-1">
                          <div className="h-0.5 bg-game-accent w-4 shadow-[0_0_8px_#00f0ff]" />
                          <h2 className="text-xs font-bold uppercase tracking-wider font-sans text-gray-300">Select Driver</h2>
                       </div>

                       {/* Mobile: Horizontal Snap Carousel | Desktop: Grid */}
                       <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 py-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden">
                         {DRIVERS.map((driver) => {
                           const isSelected = selectedDriver === driver.market;
                           return (
                             <button
                              key={driver.market}
                              onClick={() => setSelectedDriver(driver.market)}
                              className={`
                                snap-center min-w-[70vw] sm:min-w-[280px] lg:min-w-0
                                group relative p-0.5 rounded-2xl transition-all duration-300
                                ${isSelected 
                                  ? 'bg-game-accent shadow-[0_0_30px_rgba(0,240,255,0.3)] scale-[1.02] z-10' 
                                  : 'bg-white/5 hover:bg-white/10 hover:scale-[1.01]'
                                }
                              `}
                             >
                               <div className="h-full bg-[#0f172a] rounded-[14px] p-4 lg:p-3 relative overflow-hidden flex flex-col backdrop-blur-xl text-left">
                                  {/* Background Grid */}
                                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

                                  {/* Selected Indicator */}
                                  {isSelected && (
                                     <div className="absolute top-2 right-2 z-20 animate-in zoom-in duration-300">
                                        <div className="w-5 h-5 bg-game-accent text-black rounded-full flex items-center justify-center shadow-[0_0_10px_#00f0ff]">
                                           <svg className="w-3 h-3 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                           </svg>
                                        </div>
                                     </div>
                                  )}

                                  {/* Image - Compact */}
                                  <div className="relative h-24 lg:h-20 mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                      <div className={`
                                         absolute inset-0 bg-gradient-to-b from-game-accent/20 to-transparent rounded-full blur-xl transform -translate-y-2
                                         ${isSelected ? 'opacity-50' : 'opacity-0'} transition-opacity duration-500
                                      `} />
                                      <img 
                                        src={driver.image} 
                                        alt={driver.name}
                                        className={`
                                          relative z-10 w-24 h-24 lg:w-20 lg:h-20 object-contain transition-all duration-500 drop-shadow-xl
                                          ${isSelected ? 'scale-110' : 'grayscale-[0.7] group-hover:grayscale-0'}
                                        `}
                                      />
                                  </div>

                                  {/* Driver Info */}
                                  <div className={`mb-3 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    <h3 className="text-base lg:text-sm font-black uppercase italic tracking-wider mb-0.5 line-clamp-1">
                                      {driver.name}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                       <span className={`text-[10px] lg:text-[9px] font-mono px-1.5 py-0 rounded ${isSelected ? 'bg-game-accent text-black font-bold' : 'bg-white/10 text-gray-500'}`}>
                                         {driver.market}
                                       </span>
                                    </div>
                                  </div>

                                  {/* Stats - Compact */}
                                  <div className="space-y-1.5 mt-auto relative z-10 bg-black/20 p-2 rounded-lg border border-white/5">
                                     {renderStatBar('Speed', driver.stats.speed)}
                                     {renderStatBar('Handling', driver.stats.handling)}
                                     {renderStatBar('Accel', driver.stats.acceleration)}
                                  </div>
                               </div>
                             </button>
                           );
                         })}
                       </div>
                    </section>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* Fixed Sticky Footer - Docked Action Bar */}
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] sm:bottom-0 left-0 right-0 z-50 p-3 pt-0 lg:hidden pointer-events-none">
           <div className="pointer-events-auto shadow-2xl shadow-game-dark">
               <button
                  onClick={handleStartRace}
                  disabled={!selectedDriver}
                  className={`
                     w-full relative group overflow-hidden rounded-xl font-black italic tracking-widest text-lg py-4
                     transition-all duration-300 active:scale-[0.98]
                     border shadow-2xl
                     ${selectedMode === 'sprint' 
                        ? 'bg-game-accent text-black border-game-accent shadow-[0_0_50px_rgba(0,240,255,0.4)]' 
                        : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}
                  `}
               >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                     <span className="uppercase text-xl">START RACE</span>
                     <span className="text-2xl animate-pulse">►</span>
                  </span>
                  
                  {/* Glitch/Shine Effect */}
                  <div className="absolute inset-0 bg-white/40 translate-x-[-100%] animate-[shimmer_3s_infinite] skew-x-12" />
               </button>
           </div>
        </div>

        {/* Desktop Button Location (Restored from previous step) */}
        <div className="hidden lg:block lg:absolute lg:bottom-12 lg:right-8 lg:w-[calc(66%-2rem)]">
             <button
                onClick={handleStartRace}
                disabled={!selectedDriver}
                className={`
                   w-full relative group overflow-hidden rounded-xl font-black italic tracking-widest text-xl py-5
                   transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
                   border-2
                   ${selectedMode === 'sprint' 
                      ? 'bg-game-accent text-black border-game-accent shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]' 
                      : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}
                `}
             >
                <span className="relative z-10 flex items-center justify-center gap-3">
                   <span className="uppercase">START RACE</span>
                   <span className="text-2xl">►</span>
                </span>
                
                <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
             </button>
        </div>

      </div>

    </div>
  );
};
