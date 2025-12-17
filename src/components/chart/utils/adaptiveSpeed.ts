/**
 * Adaptive Speed Calculator
 * 
 * Determines animation speed based on price change magnitude.
 * Smaller price changes animate slower, larger changes animate faster.
 */

import {
  ADAPTIVE_SPEED,
  ADAPTIVE_THRESHOLDS,
  AdaptiveSpeedConfig,
} from '../config/chartAnimationConfig';

/**
 * Gets the appropriate speed configuration based on price change ratio.
 * 
 * @param changeRatio - Ratio of price change to current price (e.g., 0.001 = 0.1%)
 * @returns Speed configuration with lerp factor and max step
 */
export const getAdaptiveSpeed = (changeRatio: number): AdaptiveSpeedConfig => {
  if (changeRatio < ADAPTIVE_THRESHOLDS.tiny) {
    return ADAPTIVE_SPEED.tiny;
  } else if (changeRatio < ADAPTIVE_THRESHOLDS.small) {
    return ADAPTIVE_SPEED.small;
  } else if (changeRatio < ADAPTIVE_THRESHOLDS.medium) {
    return ADAPTIVE_SPEED.medium;
  } else {
    return ADAPTIVE_SPEED.large;
  }
};

/**
 * Calculates the warmup easing factor for smooth animation starts.
 * Prevents sudden movement by slowly ramping up speed.
 * 
 * @param timeSinceUpdate - Time in ms since last target price update
 * @param warmupDuration - Total warmup duration in ms
 * @param easingFn - Easing function to apply
 * @returns Warmup factor (0 to 1)
 */
export const calculateWarmupFactor = (
  timeSinceUpdate: number,
  warmupDuration: number,
  easingFn: (t: number) => number
): number => {
  const rawFactor = Math.min(timeSinceUpdate / warmupDuration, 1);
  return 0.2 + 0.8 * easingFn(rawFactor);
};
