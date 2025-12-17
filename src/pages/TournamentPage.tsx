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
  color: string;
}

const DRIVERS: DriverInfo[] = [
  {
    market: 'SOL',
    name: 'SOL Rider',
    image: '/motogp_1.png',
    stats: { speed: 95, handling: 88, acceleration: 92 },
    color: '#9945FF'
  },
  {
    market: 'ETH',
    name: 'ETH Champion',
    image: '/motogp_blue_transparent.png',
    stats: { speed: 92, handling: 95, acceleration: 88 },
    color: '#627EEA'
  },
  {
    market: 'BTC',
    name: 'BTC Legend',
    image: '/motogp_orange_transparent.png',
    stats: { speed: 98, handling: 85, acceleration: 95 },
    color: '#F7931A'
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0f1c] via-[#0f172a] to-[#0a0f1c] text-white overflow-auto pb-safe">
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent tracking-tight mb-2">
            🏁 RACE LOBBY
          </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm">Choose your mode and driver</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
        
        {/* Game Mode Selection */}
        <section>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <span className="w-1.5 sm:w-2 h-8 sm:h-10 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            SELECT GAME MODE
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Sprint Mode - ACTIVE */}
            <button
              onClick={() => setSelectedMode('sprint')}
              className={`
                group relative bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300
                active:scale-95 touch-manipulation
                ${selectedMode === 'sprint' 
                  ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] sm:shadow-[0_0_50px_rgba(34,211,238,0.4)]' 
                  : 'border-white/10 active:border-cyan-400/50'}
              `}
            >
              {selectedMode === 'sprint' && (
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-cyan-400 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black shadow-xl animate-pulse z-10">
                  ACTIVE
                </div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">⚡</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white">SPRINT MODE</h3>
                    <p className="text-cyan-400 text-xs sm:text-sm font-bold">Solo Racing</p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
                  Race solo in quick 10-second sprints. Go LONG or SHORT and race against time!
                </p>
                
                <div className="space-y-2 bg-black/30 rounded-xl p-3 sm:p-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-300">Quick 10s races</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-300">LONG/SHORT positions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-300">Instant rewards</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Grand Race - COMING SOON */}
            <button
              disabled
              className="group relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-white/10 overflow-hidden cursor-not-allowed touch-manipulation"
            >
              {/* Blur overlay */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 z-20 rounded-2xl sm:rounded-3xl"></div>
              
              {/* Coming Soon Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl shadow-2xl border-2 border-white/20 rotate-[-5deg]">
                COMING SOON
              </div>
              
              <div className="relative z-10 opacity-50">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">🏆</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white">GRAND RACE</h3>
                    <p className="text-purple-400 text-xs sm:text-sm font-bold">Tournament Mode</p>
                  </div>
                </div>
                
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                  Compete in multiplayer tournaments with huge prize pools and global rankings!
                </p>
                
                <div className="space-y-2 bg-black/30 rounded-xl p-3 sm:p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-purple-400 flex-shrink-0">★</span>
                    <span className="text-gray-400">Multiplayer tournaments</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-purple-400 flex-shrink-0">★</span>
                    <span className="text-gray-400">Massive prize pools</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-purple-400 flex-shrink-0">★</span>
                    <span className="text-gray-400">Global leaderboards</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Driver Selection - Only show for Sprint Mode */}
        {selectedMode === 'sprint' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></span>
              SELECT YOUR DRIVER
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {DRIVERS.map((driver) => (
                <button
                  key={driver.market}
                  onClick={() => setSelectedDriver(driver.market)}
                  className={`
                    group relative bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300
                    active:scale-95 touch-manipulation
                    ${selectedDriver === driver.market 
                      ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] sm:shadow-[0_0_30px_rgba(250,204,21,0.3)]' 
                      : 'border-white/10 active:border-yellow-400/50'}
                  `}
                >
                  {selectedDriver === driver.market && (
                    <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 bg-yellow-400 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-black shadow-lg">
                      ✓ SELECTED
                    </div>
                  )}
                  
                  <div className="relative h-32 sm:h-48 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden rounded-xl">
                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedDriver === driver.market ? 'from-yellow-500/20 to-orange-500/20' : 'from-white/5 to-transparent'} rounded-xl`}></div>
                    <img 
                      src={driver.image} 
                      alt={driver.name}
                      className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 object-contain"
                    />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2">{driver.name}</h3>
                  <div className="text-xs sm:text-sm font-mono text-gray-400 mb-3 sm:mb-4">{driver.market}</div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    {Object.entries(driver.stats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-400 uppercase">{stat}</span>
                        <div className="flex-1 mx-2 sm:mx-3 h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Start Race Button - Only for Sprint Mode */}
        {selectedMode === 'sprint' && (
          <div className="fixed sm:sticky bottom-20 sm:bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0f1c] via-[#0f172a]/95 to-transparent pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 z-40">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={handleStartRace}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:via-orange-400 hover:to-red-400 active:scale-95 text-black font-black text-base sm:text-xl py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)] sm:shadow-[0_0_50px_rgba(251,191,36,0.5)] transition-all duration-300 border-2 border-yellow-300 touch-manipulation"
              >
                🏁 START SPRINT - {selectedDriverInfo?.name.toUpperCase()}
              </button>
              
              <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-400 font-mono">
                Mode: <span className="text-cyan-400 font-bold">Sprint</span> | Driver: <span className="text-yellow-400 font-bold">{selectedDriverInfo?.name}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
