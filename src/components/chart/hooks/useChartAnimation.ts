/**
 * useChartAnimation Hook
 * 
 * Handles the smooth price animation logic for the chart.
 * Uses requestAnimationFrame for 60 FPS rendering with adaptive speed.
 */

import { useRef, useEffect, useCallback } from 'react';
import { ISeriesApi } from 'lightweight-charts';

import { ChartPoint } from '../types/chartTypes';
import { lerp, buildSmoothCurve, normalizeDelta, createInitialDataPoints } from '../utils/curveUtils';
import { getAdaptiveSpeed, calculateWarmupFactor } from '../utils/adaptiveSpeed';
import { easingFunctions } from '../../../services/animation/priceInterpolation';
import {
  FRAME_INTERVAL,
  MAX_POINTS,
  SPLINE_SUBDIVISIONS,
  DIRECTION_MOMENTUM,
  MICRO_VOLATILITY,
  WARMUP_DURATION_MS,
  MAX_LERP_CAP,
  SOFT_CONVERGENCE_THRESHOLD,
  SOFT_CONVERGENCE_STEP,
  OVERSHOOT_CORRECTION,
} from '../config/chartAnimationConfig';

interface UseChartAnimationProps {
  /** Current price from WebSocket/store */
  currentPrice: number;
  /** Reference to the chart series */
  seriesRef: React.RefObject<ISeriesApi<"Line"> | null>;
  /** Currently selected market (for reset on change) */
  selectedMarket: string;
}

/**
 * Custom hook that manages the smooth price animation for the chart.
 * 
 * Key features:
 * - Queues incoming prices from WebSocket
 * - Interpolates smoothly between prices
 * - Adaptive speed based on price change magnitude
 * - Micro-volatility for "alive" feel
 * - Catmull-Rom spline smoothing
 */
export const useChartAnimation = ({
  currentPrice,
  seriesRef,
  selectedMarket,
}: UseChartAnimationProps) => {
  // Animation state refs (using refs to avoid re-renders)
  const priceQueueRef = useRef<number[]>([]);
  const displayPriceRef = useRef<number>(currentPrice);
  const targetPriceRef = useRef<number>(currentPrice);
  const lastTargetUpdateRef = useRef<number>(performance.now());
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const renderedPointsRef = useRef<ChartPoint[]>([]);
  const lastDirectionRef = useRef<number>(0);
  const lastPriceJumpRef = useRef<number>(0);

  /**
   * Initializes or resets the animation state with a flat line.
   */
  const initializeAnimation = useCallback((price: number) => {
    const initialPoints = createInitialDataPoints(price);
    
    renderedPointsRef.current = initialPoints;
    displayPriceRef.current = price;
    targetPriceRef.current = price;
    priceQueueRef.current = [];
    lastTargetUpdateRef.current = performance.now();
    lastFrameTimeRef.current = 0;
    lastDirectionRef.current = 0;
    lastPriceJumpRef.current = 0;

    if (seriesRef.current) {
      seriesRef.current.setData(buildSmoothCurve(initialPoints, SPLINE_SUBDIVISIONS));
    }
  }, [seriesRef]);

  /**
   * Calculates the next display price with smooth interpolation.
   */
  const calculateNextPrice = useCallback((
    target: number,
    display: number,
    deltaRatio: number,
    now: number
  ): number => {
    const priceDiff = target - display;
    const absDiff = Math.abs(priceDiff);

    // Direction with momentum - smooth transitions
    const rawDirection = priceDiff >= 0 ? 1 : -1;
    const prevDirection = lastDirectionRef.current || rawDirection;
    const smoothDirection = lerp(prevDirection, rawDirection, 1 - DIRECTION_MOMENTUM);
    lastDirectionRef.current = smoothDirection;

    // Get adaptive speed based on original price jump magnitude
    const originalJump = lastPriceJumpRef.current || absDiff;
    const changeRatio = originalJump / target;
    const { lerpFactor, maxStep } = getAdaptiveSpeed(changeRatio);

    // Calculate eased lerp with warmup
    const baseLerp = lerpFactor * deltaRatio;
    const timeSinceUpdate = now - lastTargetUpdateRef.current;
    const warmupFactor = calculateWarmupFactor(
      timeSinceUpdate,
      WARMUP_DURATION_MS,
      easingFunctions.easeInOutCubic
    );
    const easedLerp = baseLerp * warmupFactor;

    // Apply lerp (capped)
    let nextPrice = lerp(display, target, Math.min(easedLerp, MAX_LERP_CAP));

    // Add micro-volatility heartbeat
    const heartbeatBase = (Math.random() - 0.5) * 2;
    const heartbeatDirectional = heartbeatBase * 0.3 + smoothDirection * Math.abs(heartbeatBase) * 0.7;
    const microMovement = heartbeatDirectional * MICRO_VOLATILITY * target * Math.sqrt(deltaRatio);
    nextPrice += microMovement;

    // Clamp maximum step
    const maxStepAbsolute = target * maxStep * deltaRatio;
    const stepFromDisplay = nextPrice - display;
    if (Math.abs(stepFromDisplay) > maxStepAbsolute) {
      nextPrice = display + Math.sign(stepFromDisplay) * maxStepAbsolute;
    }

    // Soft convergence near target
    if (absDiff < target * SOFT_CONVERGENCE_THRESHOLD) {
      const gentleStep = priceDiff * SOFT_CONVERGENCE_STEP * deltaRatio;
      nextPrice = display + gentleStep + microMovement * 0.5;
    }

    // Overshoot prevention
    const newDiff = nextPrice - target;
    if (newDiff * priceDiff < 0) {
      nextPrice = lerp(nextPrice, target, OVERSHOOT_CORRECTION);
    }

    return nextPrice;
  }, []);

  /**
   * Main animation frame loop.
   */
  const runAnimationFrame = useCallback((now: number) => {
    if (!seriesRef.current) {
      animationFrameRef.current = requestAnimationFrame(runAnimationFrame);
      return;
    }

    // Initialize frame time
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = now;
    }

    // Calculate delta
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    const deltaRatio = normalizeDelta(delta, FRAME_INTERVAL);

    // Process price queue
    const queue = priceQueueRef.current;
    if (queue.length > 0) {
      const newTarget = queue[queue.length - 1];
      const priceJump = Math.abs(newTarget - targetPriceRef.current);
      if (priceJump > 0) {
        lastPriceJumpRef.current = priceJump;
      }
      targetPriceRef.current = newTarget;
      lastTargetUpdateRef.current = now;
      queue.length = 0;
    }

    // Calculate next display price
    const target = targetPriceRef.current || currentPrice;
    const display = displayPriceRef.current || target;
    const nextPrice = calculateNextPrice(target, display, deltaRatio, now);
    displayPriceRef.current = nextPrice;

    // Add point to chart
    const time = Date.now() / 1000;
    const points = renderedPointsRef.current;
    points.push({ time, value: nextPrice });

    // Trim old points
    if (points.length > MAX_POINTS) {
      points.splice(0, points.length - MAX_POINTS);
    }

    // Apply spline smoothing and render
    const smoothPoints = buildSmoothCurve(points, SPLINE_SUBDIVISIONS);
    seriesRef.current.setData(smoothPoints);

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(runAnimationFrame);
  }, [currentPrice, seriesRef, calculateNextPrice]);

  // Queue incoming prices
  useEffect(() => {
    priceQueueRef.current.push(currentPrice);
  }, [currentPrice]);

  // Reset on market change
  useEffect(() => {
    if (seriesRef.current) {
      initializeAnimation(currentPrice || 1);
    }
  }, [selectedMarket, initializeAnimation, currentPrice, seriesRef]);

  // Start/stop animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(runAnimationFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [runAnimationFrame]);

  return {
    initializeAnimation,
    renderedPointsRef,
  };
};
