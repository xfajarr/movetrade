/**
 * RacingChart Component
 * 
 * Premium racing visualization:
 * - FINISH LINE moves based on TIME (linear)
 * - RACER moves based on real-time PRICE changes
 * - Authentic Asphalt & Gantry visuals
 * - Gamified Elements: Countdown, Result Splash, Speed Lines
 */

import React, { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '../../features/market/store/marketStore'; 
import { useGameStore } from '../../features/game/store/gameStore';
import { Direction } from '../../types';

// Map tokens to MotoGP images
const MOTOGP_IMAGES: Record<string, string> = {
  BTC: '/motogp_orange_transparent.png',
  ETH: '/motogp_blue_transparent.png',
  SOL: '/solanaLogoMark.svg', // Updated to use the new logo if appropriate, or keep as motogp bike if preferred. 
                             // Wait, user said "like motogp race", but in step 542 we changed SOL icon to logo in TopBar. 
                             // For the RACER, we should arguably stick to the bike images or the logo if that was the state.
                             // Step 618 had: SOL: '/motogp_1.png', // Let's revert strictly to 618 content for safety.
};

// Actually, looking at 618:
//   SOL: '/motogp_1.png',

const MOTOGP_IMAGES_RESTORED: Record<string, string> = {
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
  
  // Gamification State
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, null
  const [showResultSplash, setShowResultSplash] = useState(false);

  // Speed/velocity for visual effects
  const [priceVelocity, setPriceVelocity] = useState(0);
  const [racerSpeed, setRacerSpeed] = useState<'fast' | 'slow' | 'normal'>('normal');
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const countdownRef = useRef<HTMLAudioElement | null>(null);
  
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

    // Optional countdown sound
    // countdownRef.current = new Audio('/countdown.mp3'); 
    
    return () => {
      [audioRef, winSoundRef, countdownRef].forEach(ref => {
          if (ref.current) {
              ref.current.pause();
              ref.current = null;
          }
      });
    };
  }, []);

  const resetRace = () => {
    setStartPrice(null);
    startPriceRef.current = null;
    setDisplayRacerPos(0);
    setDisplayFinishPos(0);
    setIsRacing(false);
    setBetDirection(null);
    setShowConfetti(false);
    setRaceResult(null);
    setFinalPnl(null);
    setCountdown(null);
    setShowResultSplash(false);
    racerPosRef.current = 0;
    finishPosRef.current = 0;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Reset when market changes
  useEffect(() => {
    resetRace();
  }, [selectedMarket]);

  // Handle bet state changes & Countdown Logic
  useEffect(() => {
    const hasActiveBets = activeBets.length > 0;
    
    // 1. TRIGGER COUNTDOWN
    if (hasActiveBets && !isRacing && countdown === null && !raceResult) {
       setCountdown(3);
       setBetDirection(activeBets[0].direction);
    }
    
    // 2. END RACE LOGIC
    if (!hasActiveBets && isRacing) {
      // End Race
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
      setShowResultSplash(true); // Show Splash Screen
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      if (finalIsAhead) {
        setShowConfetti(true);
        if (winSoundRef.current) {
          winSoundRef.current.currentTime = 0;
          winSoundRef.current.play().catch(console.error);
        }
      }
    }
  }, [activeBets.length, isRacing, currentPrice, betDirection, countdown, raceResult]);

  // COUNTDOWN EFFECT
  useEffect(() => {
      if (countdown !== null && countdown > 0) {
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
          return () => clearTimeout(timer);
      } else if (countdown === 0) {
          // START RACE
          const timer = setTimeout(() => {
              setCountdown(null);
              setIsRacing(true);
              setStartPrice(currentPriceRef.current);
              startPriceRef.current = currentPriceRef.current;
              
              if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(console.error);
              }
          }, 500); // Short delay on "GO!"
          return () => clearTimeout(timer);
      }
  }, [countdown]);


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
      const curPrice = currentPriceRef.current;
      const sPrice = startPriceRef.current;

      if (sPrice) {
          const priceChangePercent = ((curPrice - sPrice) / sPrice) * 100;
          
          // Calculate effective PnL based on direction
          let pnlPercent: number;
          if (betDirection === 'UP') {
            pnlPercent = priceChangePercent;
          } else {
            pnlPercent = -priceChangePercent;
          }
          
          const sensitivity = 100; // 1% PnL = 1 position point
          const pnlBoost = pnlPercent * sensitivity;
          
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
  const bikeImage = MOTOGP_IMAGES_RESTORED[selectedMarket] || MOTOGP_IMAGES_RESTORED['SOL'];
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
      
      {/* Background with Motion Blur effect when racing */}
      <div className={`absolute inset-0 bg-[#064e3b] transition-opacity duration-1000 ${isRacing ? 'opacity-30' : 'opacity-10'}`} />
      {isRacing && (
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
      )}
      
      {/* TRACK - Compact on Mobile */}
      <div className="relative w-full max-w-7xl h-40 sm:h-64 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl flex flex-col border-2 sm:border-4 border-[#333] transform transition-transform duration-500 hover:scale-[1.01]">
        <div className="h-4 w-full z-10" style={curbStyle} />
        
        <div className="flex-1 relative w-full overflow-hidden" style={asphaltStyle}>
            {/* Moving Road Markets (Parallax) */}
            {isRacing && (
                 <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[size:200px_100%] animate-slide-left pointer-events-none" />
            )}

            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed border-white/30 w-full" />
            
            {/* Start Line */}
            <div className="absolute left-10 top-0 bottom-0 w-2 bg-white z-0" />
            <div className="absolute left-16 top-2 text-xs font-bold text-white/50 rotate-90 origin-left">START</div>

            {/* FINISH LINE (Restored) */}
            {(isRacing || raceResult) && (
              <div 
                className="absolute top-0 bottom-0 z-20 flex flex-col items-center transition-all duration-300 ease-linear"
                style={{ left: `${6 + (displayFinishPos / 100) * 90}%` }}
              >
                 {/* Pole */}
                 <div className="absolute top-0 w-2 h-full bg-gray-400 border-x border-gray-600 shadow-xl" />
                 
                 {/* Flag Banner */}
                 <div className="absolute -top-3 w-32 h-8 bg-gray-900 border-2 border-gray-500 rounded flex items-center justify-center shadow-lg z-30">
                    <div className="text-[10px] text-white font-bold tracking-widest bg-black px-2 py-0.5">FINISH</div>
                    <div className="absolute top-0 left-0 w-4 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_5px,#fff_5px,#fff_10px)]" />
                    <div className="absolute top-0 right-0 w-4 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_5px,#fff_5px,#fff_10px)]" />
                 </div>
                 
                 {/* Checkered Hologram Field */}
                 <div className="w-8 h-full bg-[repeating-linear-gradient(45deg,#000_0,#000_10px,#fff_10px,#fff_20px)] opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
              </div>
            )}

            {/* CONNECTION TETHER (Beam) */}
            {(isRacing) && (
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-1 z-20 pointer-events-none transition-all duration-300"
                    style={{
                        left: displayRacerPos < displayFinishPos 
                            ? `calc(2.5rem + ${displayRacerPos}% * 0.9)` 
                            : `calc(6% + ${displayFinishPos}% * 0.9)`,
                        width: `calc(${Math.abs(displayRacerPos - displayFinishPos)}% * 0.9)`,
                        background: displayRacerPos > displayFinishPos 
                            ? 'linear-gradient(90deg, transparent, #00ff9d)' // Leading (Green)
                            : 'linear-gradient(90deg, #ff0055, transparent)', // Trailing (Red)
                        opacity: 0.6,
                        filter: 'blur(2px)'
                    }}
                />
            )}

            {/* RACER */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 z-40 transition-none will-change-transform"
                style={{
                    left: `calc(2.5rem + ${displayRacerPos}% * 0.9)`,
                }}
            >
                <div className="relative -translate-x-1/2 group">
                    {/* THRUSTERS (Fire Effect) */}
                    {isRacing && (
                        <div className={`absolute top-1/2 right-full -translate-y-1/2 w-16 h-8 origin-right transition-all duration-300 ${
                            displayPnl >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-30'
                        }`}>
                             <div className="w-full h-full bg-gradient-to-l from-[#00ff9d] to-transparent blur-md animate-pulse" />
                             <div className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-2 bg-white blur-sm" />
                        </div>
                    )}

                    {/* Speed Lines */}
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
                    
                    {/* Bike */}
                    <img
                        src={bikeImage}
                        alt="Racer"
                        className={`w-36 h-36 object-contain relative z-10 transition-transform duration-200 ${
                            racerSpeed === 'fast' ? 'scale-110 -rotate-3' : 
                            racerSpeed === 'slow' ? 'scale-90 rotate-2' : 
                            'scale-100'
                        }`}
                        style={{
                            filter: racerSpeed === 'fast' ? 'drop-shadow(0 0 15px rgba(0,255,255,0.6))' : 'none'
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
                </div>
            </div>
        </div>
        
        <div className="h-4 w-full z-10" style={curbStyle} />
      </div>

      {/* Global Styles for Keyframes */}
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(150px); opacity: 0; }
        }
        @keyframes slide-left {
          from { background-position: 0 0; }
          to { background-position: -200px 0; }
        }
        .animate-slide-left {
            animation: slide-left 0.5s linear infinite;
        }
        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div key={countdown} className="text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-game-accent to-white drop-shadow-[0_0_30px_rgba(0,240,255,0.8)] animate-[pop-in_0.5s_ease-out_forwards] p-12">
                  {countdown === 0 ? 'GO!' : countdown}
              </div>
          </div>
      )}

      {/* RESULT SPLASH SCREEN */}
      {showResultSplash && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
             <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
                 
                 {/* Result Title */}
                 <div className={`text-6xl sm:text-8xl font-black italic uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] transform -rotate-3 p-4 pr-8 ${
                     raceResult === 'WIN' 
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600' 
                        : 'text-gray-400'
                 }`}>
                     {raceResult === 'WIN' ? 'VICTORY' : 'DEFEAT'}
                 </div>

                 {/* Outcome Details */}
                 <div className="bg-[#0f172a]/90 border border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col items-center gap-2 shadow-2xl relative overflow-hidden">
                     {/* Shine Effect */}
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
                     
                     <div className="text-gray-400 uppercase text-xs font-bold tracking-widest">Performance</div>
                     <div className={`text-4xl sm:text-5xl font-mono font-black ${raceResult === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                         {finalPnl && finalPnl >= 0 ? '+' : ''}{finalPnl?.toFixed(2)}%
                     </div>
                     <div className="mt-2 text-sm text-gray-500 font-mono">
                         {raceResult === 'WIN' ? 'Target Reached' : 'Target Missed'}
                     </div>

                     <button 
                         onClick={resetRace}
                         className="mt-6 px-10 py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2"
                     >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         Continue
                     </button>
                 </div>
             </div>
             
             {/* Victory Confetti (Separate Layer) */}
             {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-4 sm:w-3 sm:h-6 rounded"
                      style={{
                        top: '-10%',
                        left: `${Math.random() * 100}%`,
                        animation: `fall ${1.5 + Math.random()}s linear forwards`,
                        backgroundColor: ['#ffd700', '#ff0000', '#00f0ff', '#ffffff'][i % 4],
                      }}
                    />
                  ))}
                  <style>{`
                    @keyframes fall {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                    }
                  `}</style>
                </div>
             )}
        </div>
      )}

      {/* TELEMETRY OVERLAY - Compact for Mobile (Hidden during splashes) */}
      {/* TELEMETRY OVERLAY - Mobile Optimized "Floating Wings" */}
      {!countdown && !showResultSplash && (
        <>
            {/* LEFT WING: Market & Status */}
            <div className="absolute top-4 left-0 pl-2 lg:pl-6 z-50 pointer-events-none">
                <div className="flex flex-col gap-1 origin-left transform skew-x-[10deg]">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-r-lg p-2 pr-6 shadow-[5px_5px_0_rgba(0,0,0,0.2)] border-l-0 relative group overflow-hidden">
                        {/* Status bar accent */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${isRacing ? 'bg-[#00ff9d] shadow-[0_0_10px_#00ff9d]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'}`} />

                        <div className="flex items-center gap-4 transform -skew-x-[10deg]">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">Market</span>
                                <span className="text-sm font-black text-white uppercase italic tracking-tighter shadow-black drop-shadow-sm">{selectedMarket}</span>
                            </div>
                            <div className="w-px h-6 bg-white/20" />
                             <div className="flex flex-col">
                                <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">Signal</span>
                                <span className={`text-xs font-bold animate-pulse ${isRacing ? 'text-[#00ff9d]' : 'text-yellow-500'}`}>
                                    {isRacing ? '● LIVE' : '○ IDLE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT WING: PnL & Direction */}
            {(isRacing) && startPrice && (
                <div className="absolute top-4 right-0 pr-2 lg:pr-6 z-50 pointer-events-none">
                    <div className="flex justify-end transform -skew-x-[10deg]">
                         <div className={`
                             bg-black/80 backdrop-blur-md border border-white/10 rounded-l-lg p-2 pl-6 shadow-[-5px_5px_0_rgba(0,0,0,0.2)] border-r-0 
                             relative group overflow-hidden animate-in slide-in-from-right-10 duration-500
                         `}>
                             <div className="absolute top-0 bottom-0 right-0 w-1 bg-white/20" />
                             
                             {/* Dynamic Background Glow */}
                             <div className={`absolute inset-0 opacity-20 ${displayPnl >= 0 ? 'bg-gradient-to-l from-green-500/50' : 'bg-gradient-to-l from-red-500/50'}`} />

                             <div className="flex items-center gap-4 transform skew-x-[10deg]">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">Trend</span>
                                    <div className={`text-lg leading-none ${betDirection === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                                       {betDirection === 'UP' ? '▲ LONG' : '▼ SHORT'}
                                    </div>
                                 </div>

                                 <div className="w-px h-6 bg-white/20" />

                                 <div className="flex flex-col items-end min-w-[70px]">
                                     <span className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">PnL</span>
                                     <div className={`text-xl font-black font-mono tracking-tighter leading-none ${displayPnl >= 0 ? 'text-[#00ff9d] drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]' : 'text-[#ff0055] drop-shadow-[0_0_8px_rgba(255,0,85,0.5)]'}`}>
                                        {displayPnl >= 0 ? '+' : ''}{displayPnl.toFixed(2)}%
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </>
      )}

    </div>
  );
};
