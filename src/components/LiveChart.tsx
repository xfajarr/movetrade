
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, IPriceLine } from 'lightweight-charts';
import { useGameStore } from '../store/useGameStore';
import { easingFunctions, catmullRom } from '../services/animation/priceInterpolation';
import { getPricePrecision, formatPrice } from '../utils/formatPrice';

type ChartPoint = { time: number; value: number };

const FRAME_INTERVAL = 1000 / 60; // ~16.7ms for 60 FPS rendering
const SMOOTHING_FACTOR = 0.008; // ULTRA-SLOW - relaxed floating glide
const MICRO_VOLATILITY = 0.00015; // Very subtle heartbeat - calm, not jittery
const MAX_POINTS = 900; // Keep ~15s of history for smoother trailing
const SPLINE_SUBDIVISIONS = 4; // Higher = rounder, snake-like curves
const MAX_STEP_RATIO = 0.00015; // VERY SMALL - prevents any fast movement
const DIRECTION_MOMENTUM = 0.92; // High momentum = smoother direction changes

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

const buildSmoothCurve = (points: ChartPoint[], subdivisions: number) => {
  if (points.length < 4) return points;

  const smooth: ChartPoint[] = [points[0], points[1]];

  for (let i = 0; i < points.length - 3; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    const p3 = points[i + 3];

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

export const LiveChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Track lines for multiple bets: BetID -> PriceLine
  const linesMapRef = useRef<Map<string, IPriceLine>>(new Map());

  const activeBets = useGameStore((state) => state.player.activeBets);
  const history = useGameStore((state) => state.player.history);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const selectedMarket = useGameStore((state) => state.selectedMarket);

  const [outcomeFlash, setOutcomeFlash] = useState<'WIN' | 'LOSS' | null>(null);

  // Initialize with the current top history ID so we don't flash old results on mount
  const prevHistoryId = useRef<string | null>(history.length > 0 ? history[0].id : null);

  // Price animation pipeline
  const priceQueueRef = useRef<number[]>([]);
  const displayPriceRef = useRef<number>(currentPrice);
  const targetPriceRef = useRef<number>(currentPrice);
  const lastTargetUpdateRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : Date.now());
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const renderedPointsRef = useRef<ChartPoint[]>([]);
  const lastPrecisionRef = useRef<number>(getPricePrecision(currentPrice || 1));
  const lastDirectionRef = useRef<number>(0); // Track movement direction for smooth momentum
  const lastPriceJumpRef = useRef<number>(0); // Track original magnitude of price change

  // Watch for history updates to trigger flash (when a bet resolves)
  useEffect(() => {
    const latestBet = history[0];
    // Only trigger if we have a bet, it's a DIFFERENT bet than last time, and it's resolved
    if (latestBet && latestBet.id !== prevHistoryId.current && latestBet.result !== 'PENDING') {
      setOutcomeFlash(latestBet.result as 'WIN' | 'LOSS');

      const timer = setTimeout(() => {
        setOutcomeFlash(null);
      }, 800);

      prevHistoryId.current = latestBet.id;
      return () => clearTimeout(timer);
    } else if (latestBet && prevHistoryId.current === null) {
      // Sync ref if it was null (should be handled by init, but safety check)
      prevHistoryId.current = latestBet.id;
    }
  }, [history]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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

    const initialPrecision = getPricePrecision(currentPrice || 1);
    const newSeries = chart.addLineSeries({
      color: '#FFD700',
      lineWidth: 2,
      priceLineVisible: true, // Show the horizontal line for current price
      priceLineWidth: 1,
      priceLineColor: '#FFD700',
      priceLineStyle: 2, // Dotted style
      lastValueVisible: true, // Show the label on the Y-axis
      priceFormat: {
        type: 'custom',
        minMove: 1 / Math.pow(10, initialPrecision),
        formatter: (price: number) => formatPrice(price),
      },
    });

    // Initialize with flat line starting from the exact real price
    // This creates the steady/flat line effect when page first opens
    // Use the current price from the store (which should be the real price from Pyth)
    const initialPrice = currentPrice || 1;
    const now = Date.now() / 1000;
    const initialDataPoints: ChartPoint[] = [];
    // Create 60 data points over the last ~1 second (flat line) to seed smooth motion
    for (let i = 60; i >= 0; i--) {
      initialDataPoints.push({
        time: (now - (i * 0.016)) as any, // ~16ms intervals for 60 FPS seeding
        value: initialPrice, // Use the real price fetched from Pyth
      });
    }
    renderedPointsRef.current = initialDataPoints;
    displayPriceRef.current = initialPrice;
    targetPriceRef.current = initialPrice;
    lastTargetUpdateRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    priceQueueRef.current = [];
    newSeries.setData(buildSmoothCurve(initialDataPoints, SPLINE_SUBDIVISIONS));

    chartRef.current = chart;
    seriesRef.current = newSeries;
    lastPrecisionRef.current = initialPrecision;

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

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Feed incoming WebSocket prices into a queue for the high-FPS renderer
  useEffect(() => {
    priceQueueRef.current.push(currentPrice);
  }, [currentPrice]);

  // Reset animation state when market changes
  useEffect(() => {
    if (!seriesRef.current) return;

    const basePrice = currentPrice || 1;
    const now = Date.now() / 1000;
    const resetPoints: ChartPoint[] = [];
    for (let i = 60; i >= 0; i--) {
      resetPoints.push({
        time: (now - (i * 0.016)) as any,
        value: basePrice,
      });
    }

    renderedPointsRef.current = resetPoints;
    displayPriceRef.current = basePrice;
    targetPriceRef.current = basePrice;
    priceQueueRef.current = [];
    lastTargetUpdateRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    lastFrameTimeRef.current = 0;

    seriesRef.current.setData(buildSmoothCurve(resetPoints, SPLINE_SUBDIVISIONS));
  }, [selectedMarket]);

  // Apply price format only when precision changes
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

  // Ultra-smooth snake-like animation loop
  // Key principles: never snap, always glide, preserve direction momentum
  useEffect(() => {
    const runFrame = (now: number) => {
      if (!seriesRef.current) {
        animationFrameRef.current = requestAnimationFrame(runFrame);
        return;
      }

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = now;
      }

      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Frame delta normalization - prevents speed changes at different FPS
      // Clamped to prevent extreme values during lag spikes
      const deltaRatio = Math.min(Math.max(delta, 8) / FRAME_INTERVAL, 2.0);

      // Pull latest target from queue (freshest WebSocket data wins)
      const queue = priceQueueRef.current;
      if (queue.length > 0) {
        const newTarget = queue[queue.length - 1];
        // Calculate the ORIGINAL price jump magnitude (this is what determines speed)
        const priceJump = Math.abs(newTarget - targetPriceRef.current);
        if (priceJump > 0) {
          lastPriceJumpRef.current = priceJump;
        }
        targetPriceRef.current = newTarget;
        lastTargetUpdateRef.current = now;
        queue.length = 0;
      }

      const target = targetPriceRef.current || currentPrice;
      const display = displayPriceRef.current || target;
      const priceDiff = target - display;
      const absDiff = Math.abs(priceDiff);

      // Direction with momentum - smooth direction transitions, no sudden flips
      const rawDirection = priceDiff >= 0 ? 1 : -1;
      const prevDirection = lastDirectionRef.current || rawDirection;
      const smoothDirection = lerp(prevDirection, rawDirection, 1 - DIRECTION_MOMENTUM);
      lastDirectionRef.current = smoothDirection;

      // === ADAPTIVE SPEED BASED ON PRICE CHANGE MAGNITUDE ===
      // Small changes (last 3 digits) = very slow relaxed movement
      // Large changes (first 3 digits) = faster noticeable movement

      // Use the ORIGINAL price jump (not the shrinking display gap)
      // This ensures animation speed stays consistent throughout the animation
      const originalJump = lastPriceJumpRef.current || absDiff;
      const changeRatio = originalJump / target;

      // Thresholds for different magnitudes:
      // < 0.0001 (0.01%) = tiny change (last few digits) → VERY slow, relaxed
      // 0.0001 - 0.001 (0.01% - 0.1%) = small change → slow
      // 0.001 - 0.01 (0.1% - 1%) = medium change → moderate
      // > 0.01 (> 1%) = large change (first digits) → faster

      let adaptiveLerpFactor: number;
      let adaptiveMaxStep: number;

      if (changeRatio < 0.0001) {
        // Very tiny change (last digits) - ULTRA slow, relaxed floating
        adaptiveLerpFactor = 0.002;  // Extremely slow
        adaptiveMaxStep = 0.00004;   // Tiny max step
      } else if (changeRatio < 0.001) {
        // Small change - slow and smooth
        adaptiveLerpFactor = 0.005;
        adaptiveMaxStep = 0.0001;
      } else if (changeRatio < 0.01) {
        // Medium change - moderate speed
        adaptiveLerpFactor = 0.015;
        adaptiveMaxStep = 0.0003;
      } else {
        // Large change (first digits) - faster but still smooth
        adaptiveLerpFactor = 0.035;
        adaptiveMaxStep = 0.0008;
      }

      const baseLerp = adaptiveLerpFactor * deltaRatio;

      // Ease into movement - slower at the start for softer direction changes
      const timeSinceUpdate = now - lastTargetUpdateRef.current;
      const warmupFactor = Math.min(timeSinceUpdate / 800, 1); // 800ms warmup for extra smoothness
      const easedLerp = baseLerp * (0.2 + 0.8 * easingFunctions.easeInOutCubic(warmupFactor));

      // Apply adaptive lerp (capped for safety)
      const lerpedPrice = lerp(display, target, Math.min(easedLerp, 0.06));

      // === MICRO-VOLATILITY HEARTBEAT ===
      // Keeps the chart alive even when price is stable
      // Direction-biased: mostly follows trend, with tiny random component
      const heartbeatBase = (Math.random() - 0.5) * 2;
      const heartbeatDirectional = heartbeatBase * 0.3 + smoothDirection * Math.abs(heartbeatBase) * 0.7;
      const microMovement = heartbeatDirectional * MICRO_VOLATILITY * target * Math.sqrt(deltaRatio);

      let nextPrice = lerpedPrice + microMovement;

      // === ADAPTIVE MAXIMUM STEP CLAMPING ===
      // Uses adaptive max step based on price change magnitude
      // Small changes = tiny max step (slow), Large changes = bigger max step (faster)
      const maxStepAbsolute = target * adaptiveMaxStep * deltaRatio;
      const stepFromDisplay = nextPrice - display;

      if (Math.abs(stepFromDisplay) > maxStepAbsolute) {
        // Clamp the step but preserve direction
        nextPrice = display + Math.sign(stepFromDisplay) * maxStepAbsolute;
      }

      // === SOFT CONVERGENCE (NEVER SNAP) ===
      // When very close to target, gently drift rather than snap
      if (absDiff < target * 0.0001) {
        // Within 0.01% - ultra-gentle final approach
        const gentleStep = priceDiff * 0.15 * deltaRatio;
        nextPrice = display + gentleStep + microMovement * 0.5;
      }

      // === OVERSHOOT PREVENTION ===
      // If we've passed the target, softly pull back
      const newDiff = nextPrice - target;
      if (newDiff * priceDiff < 0) {
        // We overshot - blend back toward target
        nextPrice = lerp(nextPrice, target, 0.3);
      }

      displayPriceRef.current = nextPrice;

      // Add point to chart history
      const time = Date.now() / 1000;
      const points = renderedPointsRef.current;
      points.push({ time, value: nextPrice });

      // Trim old points
      if (points.length > MAX_POINTS) {
        points.splice(0, points.length - MAX_POINTS);
      }

      // Apply Catmull-Rom spline smoothing for rounded curves
      const smoothPoints = buildSmoothCurve(points, SPLINE_SUBDIVISIONS);
      seriesRef.current.setData(smoothPoints);

      animationFrameRef.current = requestAnimationFrame(runFrame);
    };

    animationFrameRef.current = requestAnimationFrame(runFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Manage Active Bet Lines
  useEffect(() => {
    if (!seriesRef.current) return;

    // 1. Identify active IDs
    const activeIds = new Set(activeBets.map(b => b.id));

    // 2. Remove lines for bets that are no longer active
    for (const [id, line] of linesMapRef.current.entries()) {
      if (!activeIds.has(id)) {
        seriesRef.current.removePriceLine(line);
        linesMapRef.current.delete(id);
      }
    }

    // 3. Add lines for new bets
    activeBets.forEach(bet => {
      if (!linesMapRef.current.has(bet.id)) {
        const line = seriesRef.current!.createPriceLine({
          price: bet.entryPrice,
          color: bet.direction === 'UP' ? '#00ff9d' : '#ff0055', // Colored lines based on direction
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `${bet.direction} ENTRY`,
        });
        linesMapRef.current.set(bet.id, line);
      }
    });

  }, [activeBets]); // activeBets changes whenever a bet is added or removed

  return (
    <div className="relative w-full h-full group">
      <div ref={chartContainerRef} className="w-full h-full" />

      {/* Visual Flash Overlay */}
      <div
        className={`
          pointer-events-none absolute inset-0 transition-opacity duration-700
          bg-gradient-to-t from-transparent via-transparent to-transparent
          ${outcomeFlash === 'WIN' ? 'opacity-100' : outcomeFlash === 'LOSS' ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: outcomeFlash === 'WIN'
            ? 'radial-gradient(circle at center, rgba(0, 255, 157, 0.15) 0%, transparent 70%)'
            : outcomeFlash === 'LOSS'
              ? 'radial-gradient(circle at center, rgba(255, 0, 85, 0.15) 0%, transparent 70%)'
              : undefined,
          boxShadow: outcomeFlash === 'WIN'
            ? 'inset 0 0 50px rgba(0, 255, 157, 0.2)'
            : outcomeFlash === 'LOSS'
              ? 'inset 0 0 50px rgba(255, 0, 85, 0.2)'
              : 'none'
        }}
      />

      {outcomeFlash && (
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          text-4xl font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]
          animate-bounce
          ${outcomeFlash === 'WIN' ? 'text-game-up' : 'text-game-down'}
        `}>
          {outcomeFlash}
        </div>
      )}
    </div>
  );
};
