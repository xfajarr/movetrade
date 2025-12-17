/**
 * Chart Utility Functions
 * 
 * Mathematical functions for smooth curve generation and interpolation.
 */

import { ChartPoint } from '../types/chartTypes';
import { catmullRom } from '../../../services/animation/priceInterpolation';

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Builds a smooth curve from chart points using Catmull-Rom spline interpolation.
 * This creates the snake-like, rounded curves in the chart.
 * 
 * @param points - Raw chart points
 * @param subdivisions - Number of interpolated points between each pair
 * @returns Smoothed chart points array
 */
export const buildSmoothCurve = (points: ChartPoint[], subdivisions: number): ChartPoint[] => {
  // Need at least 4 points for Catmull-Rom interpolation
  if (points.length < 4) return points;

  const smooth: ChartPoint[] = [points[0], points[1]];

  for (let i = 0; i < points.length - 3; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    const p3 = points[i + 3];

    // Generate subdivided points between p1 and p2
    for (let step = 1; step <= subdivisions; step++) {
      const t = step / (subdivisions + 1);
      smooth.push({
        time: lerp(p1.time, p2.time, t),
        value: catmullRom(p0.value, p1.value, p2.value, p3.value, t),
      });
    }

    smooth.push(p2);
  }

  smooth.push(points[points.length - 1]);
  return smooth;
};

/**
 * Creates initial flat data points for chart initialization.
 * Seeds the chart with a flat line at the given price.
 * 
 * @param price - Initial price value
 * @param pointCount - Number of points to generate (default: 60)
 * @returns Array of chart points forming a flat line
 */
export const createInitialDataPoints = (price: number, pointCount: number = 60): ChartPoint[] => {
  const now = Date.now() / 1000;
  const points: ChartPoint[] = [];
  
  for (let i = pointCount; i >= 0; i--) {
    points.push({
      time: now - (i * 0.016), // ~16ms intervals for 60 FPS seeding
      value: price,
    });
  }
  
  return points;
};

/**
 * Normalizes frame delta to prevent speed variations at different FPS.
 * Clamps to prevent extreme values during lag spikes.
 * 
 * @param delta - Actual frame delta in ms
 * @param targetInterval - Target frame interval in ms
 * @returns Normalized delta ratio
 */
export const normalizeDelta = (delta: number, targetInterval: number): number => {
  return Math.min(Math.max(delta, 8) / targetInterval, 2.0);
};
