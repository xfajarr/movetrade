
import React, { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '../features/player/store/playerStore';

interface BalanceDisplayProps {
  compact?: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ compact = false }) => {
  const balance = usePlayerStore((state) => state.balance);
  const [displayedBalance, setDisplayedBalance] = useState(balance);
  const [animClass, setAnimClass] = useState('text-white');
  
  // Animation Refs
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef<number>(balance);
  const targetValueRef = useRef<number>(balance);
  const prevBalanceRef = useRef<number>(balance);

  const DURATION = 1500; // ms for the number roll

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const timeElapsed = time - startTimeRef.current;
    const progress = Math.min(timeElapsed / DURATION, 1);
    
    // Ease out quart function for smooth landing
    const ease = 1 - Math.pow(1 - progress, 4);
    
    const current = startValueRef.current + (targetValueRef.current - startValueRef.current) * ease;
    setDisplayedBalance(current);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
        setDisplayedBalance(targetValueRef.current);
    }
  };

  useEffect(() => {
    if (balance !== targetValueRef.current) {
      // 1. Trigger Visual Flash
      if (balance > prevBalanceRef.current) {
        // Win
        setAnimClass('text-[#00ff9d] scale-110 drop-shadow-[0_0_15px_rgba(0,255,157,0.8)]');
      } else {
        // Loss / Bet
        setAnimClass('text-[#ff0055] scale-105 drop-shadow-[0_0_10px_rgba(255,0,85,0.6)]');
      }

      const timer = setTimeout(() => {
        setAnimClass('text-white');
      }, 800);

      // 2. Setup Number Animation
      startValueRef.current = displayedBalance;
      targetValueRef.current = balance;
      startTimeRef.current = undefined; // Reset time
      
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(animate);

      prevBalanceRef.current = balance;
      
      return () => clearTimeout(timer);
    }
  }, [balance]);

  // Cleanup
  useEffect(() => () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  const formattedBalance = Math.floor(displayedBalance).toLocaleString();

  if (compact) {
    return (
      <div className="flex items-center gap-3 transition-all duration-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 relative overflow-hidden">
        {/* Subtle background flash for compact mode */}
        <div className={`absolute inset-0 opacity-20 transition-colors duration-500 ${animClass.includes('text-[#00ff9d]') ? 'bg-game-up' : animClass.includes('text-[#ff0055]') ? 'bg-game-down' : 'bg-transparent'}`} />
        
        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold relative z-10">Balance</div>
        <div className={`text-sm md:text-base font-mono font-black transition-all duration-300 relative z-10 ${animClass}`}>
          ${formattedBalance}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 transition-all duration-300">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Balance</div>
      <div className={`text-3xl font-mono font-black transition-all duration-300 ${animClass}`}>
        ${formattedBalance}
      </div>
    </div>
  );
};
