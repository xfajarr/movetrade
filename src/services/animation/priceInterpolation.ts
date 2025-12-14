/**
 * Price Interpolation Engine
 * 
 * Handles smooth animation and interpolation of price values.
 * Separated from API layer for clean architecture.
 */

export interface InterpolationState {
    targetPrice: number;
    displayPrice: number;
    velocity: number;
    lastUpdateTime: number;
    lastPriceUpdate: number;
    interpolationStartPrice: number;
    interpolationStartTime: number;
    interpolationDuration: number;
    microVolatility: number;
    syntheticMovement: number;
    priceHistory: Array<{ price: number; time: number }>;
    smoothedTargetPrice: number;
    maxHistoryLength: number;
    lastWebSocketUpdateTime: number; // Track time between WebSocket updates
    adaptiveDuration: number; // Adaptive duration based on update frequency
}

export interface InterpolationConfig {
    microVolatility?: number;
    smoothingFactor?: number;
    interpolationDuration?: number;
    maxHistoryLength?: number;
}

const DEFAULT_CONFIG: Required<InterpolationConfig> = {
    microVolatility: 0.00035, // Subtle heartbeat drift - matches LiveChart
    smoothingFactor: 0.025, // Matches LiveChart's ultra-slow glide
    interpolationDuration: 2000, // Shorter duration, chart handles smooth rendering
    maxHistoryLength: 10,
};

/**
 * Creates initial interpolation state
 */
export const createInterpolationState = (
    initialPrice: number,
    config: InterpolationConfig = {}
): InterpolationState => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();

    return {
        targetPrice: initialPrice,
        displayPrice: initialPrice,
        velocity: 0,
        lastUpdateTime: now,
        lastPriceUpdate: initialPrice,
        interpolationStartPrice: initialPrice,
        interpolationStartTime: now,
        interpolationDuration: finalConfig.interpolationDuration,
        microVolatility: finalConfig.microVolatility,
        syntheticMovement: 0,
        priceHistory: [{ price: initialPrice, time: now }],
        smoothedTargetPrice: initialPrice,
        maxHistoryLength: finalConfig.maxHistoryLength,
        lastWebSocketUpdateTime: now,
        adaptiveDuration: finalConfig.interpolationDuration,
    };
};

/**
 * Updates target price with adaptive timing based on WebSocket update frequency
 * Ensures smooth, natural movement that adapts to actual data flow
 */
export const updateTargetPrice = (
    state: InterpolationState,
    newPrice: number,
    now: number
): InterpolationState => {
    const previousTarget = state.targetPrice;
    const priceJump = Math.abs(newPrice - previousTarget);
    const jumpRatio = priceJump / newPrice;

    // Always use exact WebSocket price as target (source of truth)
    const targetPrice = newPrice;

    // Calculate time since last WebSocket update
    const timeSinceLastUpdate = now - state.lastWebSocketUpdateTime;
    const avgUpdateInterval = Math.max(100, Math.min(timeSinceLastUpdate, 5000)); // Clamp between 100ms and 5s

    // Add to price history
    const priceHistory = [...state.priceHistory, { price: newPrice, time: now }];
    if (priceHistory.length > state.maxHistoryLength) {
        priceHistory.shift();
    }

    // Adaptive interpolation duration based on:
    // 1. Time between WebSocket updates (natural rhythm)
    // 2. Price change magnitude (smooth large moves)
    const priceDiff = Math.abs(targetPrice - previousTarget);
    const diffRatio = Math.min(priceDiff / targetPrice, 0.1);

    // Base duration: adapt to WebSocket update frequency
    // If updates come every 500ms, use ~1.5s duration (3x the interval)
    // If updates come every 2s, use ~4s duration (2x the interval)
    // This ensures smooth, natural flow that matches data rhythm
    const baseDuration = Math.max(800, Math.min(avgUpdateInterval * 2.5, 6000));

    // Adjust for price change magnitude
    let interpolationDuration: number;
    if (jumpRatio > 0.01) {
        // Large jumps: longer duration for smooth, calm movement
        interpolationDuration = baseDuration * 1.5 + (diffRatio * 2000);
    } else {
        // Normal moves: use adaptive duration based on update frequency
        interpolationDuration = baseDuration + (diffRatio * 1000);
    }

    // Clamp to reasonable range: 800ms to 8s
    interpolationDuration = Math.max(800, Math.min(interpolationDuration, 8000));

    return {
        ...state,
        targetPrice,
        smoothedTargetPrice: newPrice,
        priceHistory,
        interpolationStartPrice: state.displayPrice,
        interpolationStartTime: now,
        interpolationDuration,
        adaptiveDuration: interpolationDuration,
        lastPriceUpdate: newPrice,
        lastUpdateTime: now,
        lastWebSocketUpdateTime: now, // Track WebSocket update time
    };
};

/**
 * Easing functions for smooth animation
 */
export const easingFunctions = {
    easeInOutCubic: (t: number): number => {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    easeInOutQuart: (t: number): number => {
        return t < 0.5
            ? 8 * t * t * t * t
            : 1 - Math.pow(-2 * t + 2, 4) / 2;
    },

    springEase: (t: number): number => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
};

/**
 * Catmull-Rom spline interpolation for smooth curves
 */
export const catmullRom = (
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
): number => {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
};

/**
 * Interpolates display price towards target price with perfectly smooth animation
 * Adaptive timing ensures natural flow that matches WebSocket update rhythm
 */
export const interpolatePrice = (
    state: InterpolationState,
    config: InterpolationConfig = {},
    now: number = Date.now()
): number => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    const priceDiff = state.targetPrice - state.displayPrice;
    const absDiff = Math.abs(priceDiff);
    const elapsed = now - state.interpolationStartTime;
    const progress = Math.min(elapsed / state.interpolationDuration, 1);

    // Use smooth easeInOutCubic for all movements - consistent, calm, natural
    // This creates the perfectly balanced, easy-to-follow motion
    const easedProgress = easingFunctions.easeInOutCubic(progress);

    // Use Catmull-Rom spline for smooth, rounded curves (no sharp angles)
    let interpolatedPrice: number;
    if (state.priceHistory.length >= 4) {
        const p0 = state.priceHistory[state.priceHistory.length - 4].price;
        const p1 = state.priceHistory[state.priceHistory.length - 3].price;
        const p2 = state.priceHistory[state.priceHistory.length - 2].price;
        const p3 = state.targetPrice;

        const splinePrice = catmullRom(p0, p1, p2, p3, easedProgress);
        const lerpPrice = state.interpolationStartPrice +
            (state.targetPrice - state.interpolationStartPrice) * easedProgress;

        // Blend spline and lerp for perfectly smooth, rounded curves
        // Spline provides rounded shape, lerp ensures accuracy
        interpolatedPrice = splinePrice * 0.6 + lerpPrice * 0.4;
    } else if (state.priceHistory.length >= 2) {
        // Use simpler interpolation if we don't have enough history yet
        const priceRange = state.targetPrice - state.interpolationStartPrice;
        interpolatedPrice = state.interpolationStartPrice + (priceRange * easedProgress);
    } else {
        // Fallback: direct lerp
        const priceRange = state.targetPrice - state.interpolationStartPrice;
        interpolatedPrice = state.interpolationStartPrice + (priceRange * easedProgress);
    }

    // Start with current display price (no synthetic movements - only real data)
    let displayPrice = state.displayPrice;

    // Apply perfectly smooth interpolation with balanced speed
    // The blend ratio adapts to ensure smooth, continuous motion
    if (progress < 1 && absDiff > state.targetPrice * 0.00001) {
        // During active interpolation: smooth blend toward interpolated price
        // Balanced blend ratio: not too fast (rushed), not too slow (delayed)
        // 0.90/0.10 creates smooth, flowing motion that feels natural
        const blendRatio = 0.10; // 10% per frame = smooth, balanced speed
        displayPrice = displayPrice * (1 - blendRatio) + interpolatedPrice * blendRatio;
    } else {
        // When interpolation completes: gentle convergence to exact target
        // Use smooth, controlled lerp for final approach
        const lerpAdjustment = priceDiff * finalConfig.smoothingFactor;
        // Curve factor ensures smooth, rounded approach (no sharp snaps)
        const curveFactor = Math.sin(Math.min(absDiff / (state.targetPrice * 0.001), 1) * Math.PI / 2);
        displayPrice += lerpAdjustment * curveFactor;
    }

    // NO synthetic movements, waves, or fake trends - only real WebSocket data
    // The chart must represent the actual price data accurately

    // Gentle velocity-based momentum for natural flow
    // Only apply if we have meaningful velocity from real price changes
    const timeSinceLastUpdate = now - state.lastUpdateTime;
    if (timeSinceLastUpdate > 16 && Math.abs(state.velocity) > 0) {
        // Apply gentle momentum for natural, flowing movement
        // Reduced factors ensure calm, controlled motion (not rushed)
        const momentumFactor = 0.2;
        const momentum = state.velocity * timeSinceLastUpdate * momentumFactor;
        displayPrice += momentum * 0.3; // Very gentle momentum

        // Convergence factor ensures we always reach target
        const convergenceFactor = 0.00015; // Gentle convergence
        displayPrice += priceDiff * convergenceFactor;
    }

    // Ensure exact convergence to target price (source of truth)
    // When very close, use strong convergence to reach exact value
    if (absDiff < state.targetPrice * 0.0001) {
        // Very close - strong convergence to exact price (no jitter)
        const convergenceBlend = 0.995; // Very strong convergence when close
        displayPrice = state.targetPrice * (1 - convergenceBlend) + displayPrice * convergenceBlend;
    }

    // Final safety: ensure we never drift too far from real price
    // This ensures the chart always represents the WebSocket data accurately
    const maxDeviation = state.targetPrice * 0.0008; // Allow 0.08% max deviation
    if (Math.abs(displayPrice - state.targetPrice) > maxDeviation) {
        // Pull back toward exact target price (prevents drift)
        const pullbackFactor = 0.08; // Smooth pullback
        displayPrice += (state.targetPrice - displayPrice) * pullbackFactor;
    }

    return displayPrice;
};

