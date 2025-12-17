/**
 * RacingChart Component
 * 
 * Premium racing visualization:
 * - FINISH LINE moves based on TIME (linear)
 * - RACER moves based on real-time PRICE changes
 * - Authentic Asphalt & Gantry visuals
 * - Telemetry Overlay for Race Info
 */

import React, { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '../../features/market/store/marketStore'; 
import { useGameStore } from '../../features/game/store/gameStore';
import { Direction } from '../../types';

// Map tokens to MotoGP images
const MOTOGP_IMAGES: Record<string, string> = {
  BTC: '/motogp_orange_transparent.png',
  ETH: '/motogp_blue_transparent.png',
  SOL: '/motogp_1.png',
};

// Helper: Format price locally
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export const RacingChart: React.FC = () => {
  const currentPrice = useMarketStore((state) => state.currentPrice);
  const selectedMarket = useMarketStore((state) => state.selectedMarket);
  const activeBets = useGameStore((state) => state.activeBets);
  
  // Display positions
  const [displayRacerPos, setDisplayRacerPos] = useState(0);
  const [displayFinishPos, setDisplayFinishPos] = useState(0);
  
  // Race state
  const [startPrice, setStartPrice] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [betDirection, setBetDirection] = useState<Direction | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [raceResult, setRaceResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [finalPnl, setFinalPnl] = useState<number | null>(null);
  
  // Speed/velocity for visual effects
  const [priceVelocity, setPriceVelocity] = useState(0);
  const [racerSpeed, setRacerSpeed] = useState<'fast' | 'slow' | 'normal'>('normal');
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Refs for tracking (Performance Optimization)
  const racerPosRef = useRef(0);
  const finishPosRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const currentPriceRef = useRef(currentPrice); 
  const startPriceRef = useRef<number | null>(null);
  const lastPriceRef = useRef(currentPrice);
  const lastPriceTimeRef = useRef(Date.now());

  // Update refs when state changes
  useEffect(() => {
    currentPriceRef.current = currentPrice;
    
    // Calculate price velocity for visual effects
    if (isRacing && startPriceRef.current) {
      const now = Date.now();
      const timeDelta = now - lastPriceTimeRef.current;
      
      if (timeDelta > 0) {
        const priceDelta = currentPrice - lastPriceRef.current;
        const velocity = (priceDelta / lastPriceRef.current) * 1000 / timeDelta; // % per second
        setPriceVelocity(velocity);
        
        // Determine effective velocity based on bet direction
        const effectiveVel = betDirection === 'UP' ? velocity : -velocity;
        
        if (effectiveVel > 0.0001) {
          setRacerSpeed('fast');
        } else if (effectiveVel < -0.0001) {
          setRacerSpeed('slow');
        } else {
          setRacerSpeed('normal');
        }
      }
      
      lastPriceRef.current = currentPrice;
      lastPriceTimeRef.current = now;
    }
  }, [currentPrice, isRacing, betDirection]);

  useEffect(() => {
    startPriceRef.current = startPrice;
  }, [startPrice]);

  // Get current bet
  const currentBet = activeBets.length > 0 ? activeBets[0] : null;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/mixkit-racing-motorcycle-engine-speeding-up-2723.wav');
    audioRef.current.volume = 0.3;
    
    winSoundRef.current = new Audio('/winning-sound.mp3');
    winSoundRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (winSoundRef.current) {
        winSoundRef.current.pause();
        winSoundRef.current = null;
      }
    };
  }, []);

  // Reset when market changes
  useEffect(() => {
    setStartPrice(null);
    startPriceRef.current = null;
    setDisplayRacerPos(0);
    setDisplayFinishPos(0);
    setIsRacing(false);
    setBetDirection(null);
    setShowConfetti(false);
    setRaceResult(null);
    setFinalPnl(null);
    racerPosRef.current = 0;
    finishPosRef.current = 0;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedMarket]);

  // Handle bet state changes
  useEffect(() => {
    const hasActiveBets = activeBets.length > 0;
    
    if (hasActiveBets && !isRacing) {
      // START RACE
      setIsRacing(true);
      setStartPrice(currentPrice);
      startPriceRef.current = currentPrice;
      setBetDirection(activeBets[0].direction);
      setShowConfetti(false);
      setRaceResult(null);
      setFinalPnl(null);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      
      // Reset positions
      racerPosRef.current = 0;
      finishPosRef.current = 0;
      setDisplayRacerPos(0);
      setDisplayFinishPos(0);
    }
    
    if (!hasActiveBets && isRacing) {
      // END RACE - Compute final result
      const finalIsAhead = racerPosRef.current > finishPosRef.current;
      const sPrice = startPriceRef.current;
      const curPrice = currentPriceRef.current;
      
      // Calculate final PnL
      if (sPrice) {
        const priceChange = ((curPrice - sPrice) / sPrice) * 100;
        const pnl = betDirection === 'UP' ? priceChange : -priceChange;
        setFinalPnl(pnl);
        setRaceResult(pnl >= 0 ? 'WIN' : 'LOSS');
      }
      
      setIsRacing(false);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      if (finalIsAhead) {
        setShowConfetti(true);
        // Play winning sound!
        if (winSoundRef.current) {
          winSoundRef.current.currentTime = 0;
          winSoundRef.current.play().catch(console.error);
        }
      }
      
      // IMMEDIATE RESET of racer to start line
      racerPosRef.current = 0;
      finishPosRef.current = 0;
      setDisplayRacerPos(0);
      setDisplayFinishPos(0);

      // Full cleanup after delay
      setTimeout(() => {
        if (useGameStore.getState().activeBets.length === 0) {
            setStartPrice(null);
            startPriceRef.current = null;
            setShowConfetti(false);
            setBetDirection(null);
            setRaceResult(null);
            setFinalPnl(null);
        }
      }, 4000);
    }
  }, [activeBets.length, isRacing, currentPrice, betDirection]);

  // ANIMATION LOOP
  useEffect(() => {
    if (!isRacing || !currentBet || !betDirection) return;

    const updateLoop = () => {
      const now = Date.now();
      
      // 1. UPDATE FINISH LINE (TIME PROGRESS - this is the countdown/timer visual)
      const elapsed = now - currentBet.startTime;
      const duration = currentBet.endTime - currentBet.startTime;
      let timeProgress = (elapsed / duration) * 100;
      timeProgress = Math.min(100, Math.max(0, timeProgress));
      
      // Finish line moves from 0 to 100 over the race duration
      finishPosRef.current = timeProgress;
      setDisplayFinishPos(timeProgress);

      // 2. UPDATE RACER (PURELY BASED ON PnL)
      // Racer position = 50 (midpoint) + PnL boost
      // If PnL is positive, racer is ahead of center
      // If PnL is negative, racer is behind center
      // To WIN: racer must be at or past 100 (finish line position)
      const curPrice = currentPriceRef.current;
      const sPrice = startPriceRef.current;

      if (sPrice) {
          const priceChangePercent = ((curPrice - sPrice) / sPrice) * 100;
          
          // Calculate effective PnL based on direction
          let pnlPercent: number;
          if (betDirection === 'UP') {
            // LONG: profit when price goes UP
            pnlPercent = priceChangePercent;
          } else {
            // SHORT: profit when price goes DOWN
            pnlPercent = -priceChangePercent;
          }
          
          // Racer position:
          // - Base: time progress (racer moves with time)
          // - Boost: PnL amplified (positive PnL = faster, negative PnL = slower)
          // - Sensitivity: how much PnL affects position (higher = more dramatic)
          const sensitivity = 100; // 1% PnL = 1 position point
          const pnlBoost = pnlPercent * sensitivity;
          
          // Racer position = time progress + PnL boost
          // If positive PnL, racer races ahead of the time
          // If negative PnL, racer falls behind the time
          let racerPosition = timeProgress + pnlBoost;
          racerPosition = Math.max(0, Math.min(100, racerPosition));
          
          racerPosRef.current = racerPosition;
          setDisplayRacerPos(racerPosition);
      }

      if (isRacing) {
        animationRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRacing, currentBet, betDirection]);

  // Derived display values
  const bikeImage = MOTOGP_IMAGES[selectedMarket] || MOTOGP_IMAGES['SOL'];
  const priceChangeRaw = startPrice ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
  const effectivePnl = betDirection === 'UP' ? priceChangeRaw : -priceChangeRaw;
  
  // For display during race
  const displayPnl = isRacing ? effectivePnl : (finalPnl ?? 0);

  // Visual Styles
  const asphaltStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E"), linear-gradient(to bottom, #333 0%, #1a1a1a 100%)`,
      backgroundBlendMode: 'overlay' as const,
  };

  const curbStyle = {
      backgroundImage: `repeating-linear-gradient(90deg, #cc0000 0, #cc0000 40px, #eeeeee 40px, #eeeeee 80px)`,
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
  };

  return (
    <div className="relative w-full h-full bg-[#1e293b] overflow-hidden select-none flex items-center justify-center p-2 sm:p-6">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#064e3b] opacity-20" />
      
      {/* TRACK - Compact on Mobile */}
      <div className="relative w-full max-w-7xl h-40 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl flex flex-col border-2 sm:border-4 border-[#333]">
        <div className="h-4 w-full z-10" style={curbStyle} />
        
        <div className="flex-1 relative w-full overflow-hidden" style={asphaltStyle}>
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed border-white/30 w-full" />
            
            {/* Start Line */}
            <div className="absolute left-10 top-0 bottom-0 w-2 bg-white z-0" />
            <div className="absolute left-16 top-2 text-xs font-bold text-white/50 rotate-90 origin-left">START</div>

            {/* FINISH LINE */}
            {isRacing && (
              <div 
                className="absolute top-0 bottom-0 z-20 flex flex-col items-center"
                style={{ left: `${6 + (displayFinishPos / 100) * 90}%` }}
              >
                 <div className="absolute top-0 w-2 h-full bg-gray-400 border-x border-gray-600 shadow-xl" />
                 <div className="absolute -top-3 w-32 h-8 bg-gray-900 border-2 border-gray-500 rounded flex items-center justify-center shadow-lg z-30">
                    <div className="text-[10px] text-white font-bold tracking-widest bg-black px-2 py-0.5">FINISH</div>
                    <div className="absolute top-0 left-0 w-4 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_5px,#fff_5px,#fff_10px)]" />
                    <div className="absolute top-0 right-0 w-4 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_5px,#fff_5px,#fff_10px)]" />
                 </div>
                 <div className="w-8 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,#fff_10px,#fff_20px)] opacity-90 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
              </div>
            )}

            {/* RACER */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 z-40 transition-none will-change-transform"
                style={{
                    left: `calc(2.5rem + ${displayRacerPos}% * 0.9)`,
                }}
            >
                <div className="relative -translate-x-1/2 group">
                    {/* Speed Lines - show when moving fast */}
                    {isRacing && racerSpeed === 'fast' && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                                    style={{
                                        top: `${20 + i * 15}%`,
                                        left: '-100%',
                                        width: '80px',
                                        animation: `speedLine 0.3s linear infinite`,
                                        animationDelay: `${i * 0.06}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Bike with dynamic tilt */}
                    <img
                        src={bikeImage}
                        alt="Racer"
                        className={`w-36 h-36 object-contain relative z-10 transition-transform duration-200 ${
                            racerSpeed === 'fast' ? 'scale-110 -rotate-6' : 
                            racerSpeed === 'slow' ? 'scale-90 rotate-3' : 
                            'scale-100'
                        }`}
                        style={{
                            filter: racerSpeed === 'fast' ? 'drop-shadow(0 0 10px rgba(0,255,255,0.5))' : 'none'
                        }}
                    />
                    
                    {/* Shadow */}
                    <div className="absolute bottom-6 left-4 right-4 h-3 bg-black/40 blur-md rounded-[100%]" />
                    
                    {/* PnL Badge on Racer */}
                    {(isRacing || raceResult) && (
                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black px-3 py-1.5 rounded-lg shadow-lg z-20 transition-all duration-200 ${
                            displayPnl >= 0 ? 'bg-green-500 text-black scale-110' : 'bg-red-500 text-white scale-95'
                        }`}>
                            {displayPnl >= 0 ? '▲' : '▼'} {Math.abs(displayPnl).toFixed(2)}%
                        </div>
                    )}
                    
                    {/* Speed indicator glow */}
                    {isRacing && racerSpeed === 'fast' && (
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
                    )}
                </div>
            </div>
        </div>
        
        <div className="h-4 w-full z-10" style={curbStyle} />
      </div>

      {/* Add keyframes for speed lines */}
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(150px); opacity: 0; }
        }
      `}</style>

      {/* TELEMETRY OVERLAY - Compact for Mobile */}
      <div className="absolute top-2 sm:top-5 left-2 sm:left-5 right-2 sm:right-5 flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 pointer-events-none z-50">
         {/* LEFT: Race Status - Compact Mobile */}
         <div className="bg-black/90 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-3 rounded-lg sm:rounded-xl border border-white/10 shadow-xl flex gap-2 sm:gap-4">
             <div>
                <div className="text-gray-400 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest">Market</div>
                <div className="text-sm sm:text-xl font-black text-white italic">{selectedMarket}</div>
             </div>
             <div className="w-px bg-white/20" />
             <div>
                <div className="text-gray-400 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest">Status</div>
                <div className={`text-[10px] sm:text-sm font-bold ${isRacing ? 'text-green-400 animate-pulse' : (raceResult ? (raceResult === 'WIN' ? 'text-yellow-400' : 'text-red-400') : 'text-yellow-500')}`}>
                    {isRacing ? '● LIVE' : (raceResult ? `● ${raceResult}` : '● READY')}
                </div>
             </div>
         </div>

         {/* RIGHT: Live Telemetry - Compact Mobile */}
         {(isRacing || raceResult) && startPrice && (
             <div className="bg-black/90 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/20 shadow-2xl flex items-center gap-3 sm:gap-6">
                 {/* Entry */}
                 <div className="flex flex-col items-center">
                    <div className="text-gray-500 text-[8px] sm:text-[10px] font-mono uppercase">Entry</div>
                    <div className="font-mono font-bold text-[10px] sm:text-base text-white">{formatCurrency(startPrice)}</div>
                 </div>

                 {/* Direction Arrow - Compact */}
                 <div className={`text-base sm:text-2xl ${betDirection === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                    {betDirection === 'UP' ? '▲' : '▼'}
                 </div>

                 {/* Current */}
                 <div className="flex flex-col items-center">
                    <div className="text-gray-500 text-[8px] sm:text-[10px] font-mono uppercase">Current</div>
                    <div className={`font-mono font-bold text-[11px] sm:text-lg ${displayPnl >= 0 ? 'text-white' : 'text-red-300'}`}>
                        {formatCurrency(currentPrice)}
                    </div>
                 </div>

                 <div className="hidden sm:block w-px h-8 bg-white/20" />

                 {/* PnL Big Display */}
                 <div className="flex flex-col items-end min-w-[60px] sm:min-w-[80px]">
                    <div className="text-gray-500 text-[8px] sm:text-[10px] font-mono uppercase">PnL</div>
                    <div className={`font-black text-lg sm:text-2xl tracking-tighter ${displayPnl >= 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}>
                        {displayPnl >= 0 ? '+' : ''}{displayPnl.toFixed(2)}%
                    </div>
                 </div>
             </div>
         )}
      </div>

      {/* Victory Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded"
              style={{
                top: '-10%',
                left: `${Math.random() * 100}%`,
                animation: `fall ${2 + Math.random()}s linear forwards`,
                backgroundColor: ['#ffd700', '#ff0000', '#ffffff', '#00ff00'][i % 4],
              }}
            />
          ))}
          <style>{`
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
          
          {/* WINNER Banner */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black font-black text-5xl px-10 py-5 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.6)] border-4 border-white rotate-[-5deg] animate-bounce">
              🏆 WINNER!
          </div>
        </div>
      )}
      
      {/* LOSS Banner */}
      {raceResult === 'LOSS' && !isRacing && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-4xl px-10 py-5 rounded-2xl shadow-xl border-4 border-red-900 z-50 animate-pulse">
            LOSS: {finalPnl?.toFixed(2)}%
        </div>
      )}

    </div>
  );
};

export default RacingChart;
