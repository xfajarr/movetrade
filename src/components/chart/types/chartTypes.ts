/**
 * Chart Type Definitions
 */

import { IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';

/** Single chart data point */
export interface ChartPoint {
  time: number;
  value: number;
}

/** Chart instance references */
export interface ChartRefs {
  chart: IChartApi | null;
  series: ISeriesApi<"Line"> | null;
  betLines: Map<string, IPriceLine>;
}

/** Animation state refs */
export interface AnimationRefs {
  priceQueue: number[];
  displayPrice: number;
  targetPrice: number;
  lastTargetUpdate: number;
  lastFrameTime: number;
  animationFrame: number | null;
  renderedPoints: ChartPoint[];
  lastPrecision: number;
  lastDirection: number;
  lastPriceJump: number;
}

/** Bet result flash state */
export type OutcomeFlash = 'WIN' | 'LOSS' | null;
