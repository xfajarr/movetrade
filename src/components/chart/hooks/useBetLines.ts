/**
 * useBetLines Hook
 * 
 * Manages the price lines on the chart for active bets.
 */

import { useEffect, useRef } from 'react';
import { ISeriesApi, IPriceLine } from 'lightweight-charts';
import { Bet } from '../../../types';
import { BET_LINE_STYLES } from '../config/chartStyleConfig';

interface UseBetLinesProps {
  /** Reference to chart series */
  seriesRef: React.RefObject<ISeriesApi<"Line"> | null>;
  /** Array of active bets */
  activeBets: Bet[];
}

/**
 * Custom hook that manages bet entry price lines on the chart.
 * 
 * - Adds lines for new bets
 * - Removes lines for resolved bets
 * - Color-codes by direction (green for UP, red for DOWN)
 */
export const useBetLines = ({ seriesRef, activeBets }: UseBetLinesProps) => {
  const linesMapRef = useRef<Map<string, IPriceLine>>(new Map());

  useEffect(() => {
    if (!seriesRef.current) return;

    const series = seriesRef.current;
    const activeIds = new Set(activeBets.map(b => b.id));

    // Remove lines for resolved bets
    for (const [id, line] of linesMapRef.current.entries()) {
      if (!activeIds.has(id)) {
        series.removePriceLine(line);
        linesMapRef.current.delete(id);
      }
    }

    // Add lines for new bets
    activeBets.forEach(bet => {
      if (!linesMapRef.current.has(bet.id)) {
        const style = bet.direction === 'UP' ? BET_LINE_STYLES.UP : BET_LINE_STYLES.DOWN;
        
        const line = series.createPriceLine({
          price: bet.entryPrice,
          ...style,
          title: `${bet.direction} ENTRY`,
        });
        
        linesMapRef.current.set(bet.id, line);
      }
    });
  }, [activeBets, seriesRef]);

  return { linesMapRef };
};
