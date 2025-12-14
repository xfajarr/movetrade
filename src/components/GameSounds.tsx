
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const GameSounds: React.FC = () => {
  const history = useGameStore(state => state.player.history);
  const prevHistoryLength = useRef(history.length);

  useEffect(() => {
    // Only play sound if a new bet was added (history length increased)
    if (history.length > prevHistoryLength.current) {
      const latestBet = history[0];
      // Check if it's a freshly resolved bet (not just history loaded from somewhere)
      if (latestBet && latestBet.result !== 'PENDING') {
        if (latestBet.result === 'WIN') playWinSound();
        else if (latestBet.result === 'LOSS') playLossSound();
      }
      prevHistoryLength.current = history.length;
    }
  }, [history]);

  const playWinSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      // Play a happy major arpeggio sweep
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const playLossSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      // Play a sad descending tone
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  return null;
};
