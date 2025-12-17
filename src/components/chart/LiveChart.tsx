/**
 * LiveChart Component
 * 
 * Real-time price chart with smooth animation and bet visualization.
 * 
 * Features:
 * - Ultra-smooth price animation with Catmull-Rom spline interpolation
 * - Adaptive speed based on price change magnitude
 * - Visual bet entry lines for active positions
 * - WIN/LOSS flash overlay on bet resolution
 */

import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

import { useGameStore } from '../../store/useGameStore';
import { getPricePrecision, formatPrice } from '../../utils/formatPrice';

// Chart modules
import { createChartOptions, createLineSeriesOptions } from './config/chartStyleConfig';
import { SPLINE_SUBDIVISIONS } from './config/chartAnimationConfig';
import { useChartAnimation } from './hooks/useChartAnimation';
import { useBetLines } from './hooks/useBetLines';
import { useOutcomeFlash } from './hooks/useOutcomeFlash';
import { OutcomeFlashOverlay } from './components/OutcomeFlashOverlay';
import { buildSmoothCurve, createInitialDataPoints } from './utils/curveUtils';

/**
 * LiveChart - Main chart component
 */
export const LiveChart: React.FC = () => {
  // Refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastPrecisionRef = useRef<number>(0);

  // Store state
  const activeBets = useGameStore((state) => state.player.activeBets);
  const history = useGameStore((state) => state.player.history);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const selectedMarket = useGameStore((state) => state.selectedMarket);

  // Custom hooks
  const { outcomeFlash } = useOutcomeFlash({ history });
  useBetLines({ seriesRef, activeBets });
  useChartAnimation({ currentPrice, seriesRef, selectedMarket });

  // Initialize chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, createChartOptions());
    
    // Create line series
    const series = chart.addLineSeries(createLineSeriesOptions(currentPrice));

    // Initialize with flat line at current price
    const initialPrice = currentPrice || 1;
    const initialPoints = createInitialDataPoints(initialPrice);
    series.setData(buildSmoothCurve(initialPoints, SPLINE_SUBDIVISIONS));

    // Store refs
    chartRef.current = chart;
    seriesRef.current = series;
    lastPrecisionRef.current = getPricePrecision(initialPrice);

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!chartRef.current) return;
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            chartRef.current.applyOptions({ width, height });
          }
        }
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update price format when precision changes
  useEffect(() => {
    if (!seriesRef.current) return;
    
    const precision = getPricePrecision(currentPrice);
    if (precision === lastPrecisionRef.current) return;

    lastPrecisionRef.current = precision;
    seriesRef.current.applyOptions({
      priceFormat: {
        type: 'custom',
        minMove: 1 / Math.pow(10, precision),
        formatter: (price: number) => formatPrice(price),
      },
    });
  }, [currentPrice]);

  return (
    <div className="relative w-full h-full group">
      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Outcome flash overlay */}
      <OutcomeFlashOverlay outcomeFlash={outcomeFlash} />
    </div>
  );
};

export default LiveChart;
