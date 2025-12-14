/**
 * Application Constants
 * 
 * Centralized configuration values for the prediction game.
 * Extract from store to make them easily configurable.
 */

import type { Market } from '../types/market.types';

// Game Configuration
export const BET_DURATION_MS = 10000; // Default 10 seconds per bet
export const BET_DURATION_OPTIONS_MS = [10000, 15000, 30000, 45000, 60000]; // Available timeframes: 10s, 15s, 30s, 45s, 60s
export const BASE_PROFIT_RATE = 0.95; // 95% profit on win normally
export const LEVERAGE_BONUS_RATE = 0.05; // 5% bonus per leverage level

// Market Base Prices
export const MARKET_PRICES: Record<Market, number> = {
    BTC: 95400.00,
    ETH: 3250.00,
    SOL: 130.52
};

// Default Player Settings
export const DEFAULT_BALANCE = 5000;
export const DEFAULT_BET_AMOUNT = 100;
export const DEFAULT_LEVERAGE = 10;
export const DEFAULT_MARKET: Market = 'SOL';

// Price Simulation Settings
export const PRICE_UPDATE_INTERVAL_MS = 200; // Update every millisecond for ultra-smooth animation
export const PRICE_STARTUP_DURATION_MS = 2000; // 2 seconds of flat line before volatility kicks in
export const PRICE_TREND_CHANGE_INTERVAL_MS = 50; // Trend changes every 50ms for frequent direction switches
export const PRICE_RANDOM_DIRECTION_CHANGE_MS = 20; // Random direction changes every 20ms

// Per-token volatility parameters for unique movement characteristics
// Designed for: volatile data, slow and smooth visual animation
export const TOKEN_VOLATILITY: Record<Market, {
    volatilityBase: number;      // Base volatility multiplier (data can be volatile)
    trendStrength: number;       // How strong trends are
    velocityFriction: number;   // Friction (0.95-0.99, higher = smoother/slower)
    maxVelocityMultiplier: number; // Max velocity clamp (lower = slower visual movement)
    accelerationFrequency: number; // How often to apply acceleration (ms)
}> = {
    BTC: {
        volatilityBase: 0.00025,      // High data volatility (data can move fast)
        trendStrength: 0.00006,       // Weaker trends for more frequent direction changes
        velocityFriction: 0.998,       // Extremely high friction = ultra-smooth, very slow visual movement
        maxVelocityMultiplier: 0.0008,  // Very low max velocity = very slow visual movement
        accelerationFrequency: 2,     // More frequent acceleration updates for randomness
    },
    ETH: {
        volatilityBase: 0.00022,      // High data volatility (data can move fast)
        trendStrength: 0.00005,       // Weaker trends for more frequent direction changes
        velocityFriction: 0.9975,       // Extremely high friction = ultra-smooth, very slow visual movement
        maxVelocityMultiplier: 0.0007,  // Very low max velocity = very slow visual movement
        accelerationFrequency: 2,      // More frequent acceleration updates for randomness
    },
    SOL: {
        volatilityBase: 0.00028,      // Very high data volatility (data can move fast)
        trendStrength: 0.00007,       // Weaker trends for more frequent direction changes
        velocityFriction: 0.997,       // Extremely high friction = ultra-smooth, very slow visual movement
        maxVelocityMultiplier: 0.0009,  // Very low max velocity = very slow visual movement
        accelerationFrequency: 1,     // Most frequent acceleration updates for maximum randomness
    },
};

export const PRICE_FLOOR = 0.01;

// UI Settings
export const FLASH_DURATION_MS = 800;
export const CHART_UPDATE_INTERVAL_MS = 16; // ~60fps
