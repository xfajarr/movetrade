/**
 * OutcomeFlashOverlay Component
 * 
 * Displays a visual flash overlay when a bet resolves.
 */

import React from 'react';
import { OutcomeFlash } from '../types/chartTypes';

interface OutcomeFlashOverlayProps {
  /** Current flash state */
  outcomeFlash: OutcomeFlash;
}

/**
 * Visual overlay that flashes green (WIN) or red (LOSS) when bets resolve.
 */
export const OutcomeFlashOverlay: React.FC<OutcomeFlashOverlayProps> = ({ outcomeFlash }) => {
  if (!outcomeFlash) return null;

  const isWin = outcomeFlash === 'WIN';

  return (
    <>
      {/* Background glow */}
      <div
        className={`
          pointer-events-none absolute inset-0 transition-opacity duration-700
          ${outcomeFlash ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: isWin
            ? 'radial-gradient(circle at center, rgba(0, 255, 157, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(255, 0, 85, 0.15) 0%, transparent 70%)',
          boxShadow: isWin
            ? 'inset 0 0 50px rgba(0, 255, 157, 0.2)'
            : 'inset 0 0 50px rgba(255, 0, 85, 0.2)',
        }}
      />

      {/* Text label */}
      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          text-4xl font-black tracking-widest uppercase 
          drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]
          animate-bounce
          ${isWin ? 'text-game-up' : 'text-game-down'}
        `}
      >
        {outcomeFlash}
      </div>
    </>
  );
};
