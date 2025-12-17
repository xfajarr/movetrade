/**
 * useOutcomeFlash Hook
 * 
 * Manages the WIN/LOSS flash overlay when bets resolve.
 */

import { useState, useEffect, useRef } from 'react';
import { Bet } from '../../../types';
import { OutcomeFlash } from '../types/chartTypes';

const FLASH_DURATION_MS = 800;

interface UseOutcomeFlashProps {
  /** Bet history array (newest first) */
  history: Bet[];
}

/**
 * Custom hook that triggers visual flash overlay when a bet resolves.
 * 
 * - Watches for new entries in bet history
 * - Triggers WIN or LOSS flash
 * - Auto-clears after duration
 */
export const useOutcomeFlash = ({ history }: UseOutcomeFlashProps) => {
  const [outcomeFlash, setOutcomeFlash] = useState<OutcomeFlash>(null);
  const prevHistoryIdRef = useRef<string | null>(
    history.length > 0 ? history[0].id : null
  );

  useEffect(() => {
    const latestBet = history[0];
    
    // Only trigger if new bet and it's resolved
    if (
      latestBet &&
      latestBet.id !== prevHistoryIdRef.current &&
      latestBet.result !== 'PENDING'
    ) {
      setOutcomeFlash(latestBet.result as OutcomeFlash);

      const timer = setTimeout(() => {
        setOutcomeFlash(null);
      }, FLASH_DURATION_MS);

      prevHistoryIdRef.current = latestBet.id;
      return () => clearTimeout(timer);
    } else if (latestBet && prevHistoryIdRef.current === null) {
      prevHistoryIdRef.current = latestBet.id;
    }
  }, [history]);

  return { outcomeFlash };
};
