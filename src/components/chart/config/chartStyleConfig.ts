/**
 * Chart Style Configuration
 * 
 * Visual styling for the TradingView Lightweight Charts.
 */

import { ColorType, CrosshairMode, DeepPartial, ChartOptions, LineSeriesOptions } from 'lightweight-charts';
import { getPricePrecision, formatPrice } from '../../../utils/formatPrice';

/**
 * Creates the main chart configuration options.
 */
export const createChartOptions = (): DeepPartial<ChartOptions> => ({
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: '#64748b',
    fontFamily: '"Chakra Petch", sans-serif',
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: 'rgba(255, 215, 0, 0.1)', style: 2 },
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: true,
    rightOffset: 10,
    barSpacing: 5,
    fixLeftEdge: false,
    lockVisibleTimeRangeOnResize: true,
    rightBarStaysOnScroll: true,
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 215, 0, 0.2)',
    scaleMargins: {
      top: 0.2,
      bottom: 0.2,
    },
    visible: true,
  },
  crosshair: {
    mode: CrosshairMode.Magnet,
    vertLine: { visible: false },
    horzLine: {
      color: '#FFD700',
      labelBackgroundColor: '#FFD700',
    },
  },
  handleScroll: false,
  handleScale: false,
  kineticScroll: { touch: false, mouse: false },
});

/**
 * Creates line series configuration options.
 * 
 * @param price - Current price for precision calculation
 */
export const createLineSeriesOptions = (price: number): DeepPartial<LineSeriesOptions> => {
  const precision = getPricePrecision(price || 1);
  
  return {
    color: '#FFD700',
    lineWidth: 2,
    priceLineVisible: true,
    priceLineWidth: 1,
    priceLineColor: '#FFD700',
    priceLineStyle: 2, // Dotted
    lastValueVisible: true,
    priceFormat: {
      type: 'custom',
      minMove: 1 / Math.pow(10, precision),
      formatter: (price: number) => formatPrice(price),
    },
  };
};

/**
 * Style configuration for bet entry price lines.
 */
export const BET_LINE_STYLES = {
  UP: {
    color: '#00ff9d',
    lineWidth: 2 as const,
    lineStyle: 2, // Dashed
    axisLabelVisible: true,
  },
  DOWN: {
    color: '#ff0055',
    lineWidth: 2 as const,
    lineStyle: 2, // Dashed
    axisLabelVisible: true,
  },
};
