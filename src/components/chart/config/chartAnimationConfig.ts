/**
 * Chart Animation Configuration
 * 
 * All tunable constants for chart animation behavior.
 * Adjust these values to control animation speed and smoothness.
 */

// =============================================================================
// RENDERING
// =============================================================================

/** Target frame interval in ms for 60 FPS rendering */
export const FRAME_INTERVAL = 1000 / 60; // ~16.7ms

/** Maximum number of points to keep in chart history */
export const MAX_POINTS = 900;

/** Number of Catmull-Rom spline subdivisions for smooth curves */
export const SPLINE_SUBDIVISIONS = 4;

// =============================================================================
// ANIMATION SPEED (Lower = Slower)
// =============================================================================

/** Base smoothing factor for price interpolation - GLACIAL slow */
export const SMOOTHING_FACTOR = 0.0005;

/** Maximum step ratio per frame - prevents fast movement */
export const MAX_STEP_RATIO = 0.000008;

/** Direction momentum (0-1) - higher = smoother direction changes */
export const DIRECTION_MOMENTUM = 0.995;

/** Warmup duration in ms before reaching full animation speed */
export const WARMUP_DURATION_MS = 3000;

/** Maximum lerp cap per frame - limits how fast price can change */
export const MAX_LERP_CAP = 0.01;

// =============================================================================
// MICRO-VOLATILITY (Subtle movement when price is stable)
// =============================================================================

/** Micro volatility factor - creates subtle "alive" movement */
export const MICRO_VOLATILITY = 0.00001;

// =============================================================================
// ADAPTIVE SPEED THRESHOLDS
// Based on price change magnitude relative to current price
// =============================================================================

export interface AdaptiveSpeedConfig {
  /** Lerp factor for this magnitude level */
  lerpFactor: number;
  /** Maximum step size for this magnitude level */
  maxStep: number;
}

/**
 * Adaptive speed settings based on price change ratio.
 * Smaller changes = slower animation, larger changes = faster (but still smooth)
 */
export const ADAPTIVE_SPEED: Record<'tiny' | 'small' | 'medium' | 'large', AdaptiveSpeedConfig> = {
  // < 0.01% change - glacial, barely noticeable movement
  tiny: {
    lerpFactor: 0.0001,
    maxStep: 0.000002,
  },
  // 0.01% - 0.1% change - very slow and smooth
  small: {
    lerpFactor: 0.0003,
    maxStep: 0.000005,
  },
  // 0.1% - 1% change - slow but visible
  medium: {
    lerpFactor: 0.001,
    maxStep: 0.00002,
  },
  // > 1% change - moderate speed, still smooth
  large: {
    lerpFactor: 0.003,
    maxStep: 0.00006,
  },
};

/** Thresholds for determining which adaptive speed to use */
export const ADAPTIVE_THRESHOLDS = {
  tiny: 0.0001,    // < 0.01%
  small: 0.001,    // 0.01% - 0.1%
  medium: 0.01,    // 0.1% - 1%
  // > medium = large
};

// =============================================================================
// SOFT CONVERGENCE
// =============================================================================

/** Threshold (as ratio of target) for switching to gentle final approach */
export const SOFT_CONVERGENCE_THRESHOLD = 0.0001; // 0.01%

/** Gentle step multiplier for final approach */
export const SOFT_CONVERGENCE_STEP = 0.15;

/** Overshoot correction blend factor */
export const OVERSHOOT_CORRECTION = 0.3;
