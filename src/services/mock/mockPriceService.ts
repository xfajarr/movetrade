/**
 * Mock Price Service
 * 
 * Simulates real-time price feed with highly volatile, millisecond-precision updates.
 * Each token has unique movement characteristics for independent price behavior.
 * Features smooth interpolation and startup phase for cinematic animation.
 * This will be replaced with real API/WebSocket in production.
 */

import { Market } from '../../types';
import {
    MARKET_PRICES,
    PRICE_UPDATE_INTERVAL_MS,
    PRICE_STARTUP_DURATION_MS,
    PRICE_TREND_CHANGE_INTERVAL_MS,
    PRICE_RANDOM_DIRECTION_CHANGE_MS,
    TOKEN_VOLATILITY,
    PRICE_FLOOR
} from '../../config/constants';

export interface IPriceService {
    subscribe(callback: (price: number) => void): void;
    unsubscribe(): void;
    getCurrentPrice(): number;
    setMarket(market: Market): void;
}

class MockPriceService implements IPriceService {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private callback: ((price: number) => void) | null = null;
    private currentPrice: number;
    private velocity: number = 0;
    private trend: number = 0;
    private lastUpdateTime: number = 0;
    private currentMarket: Market = 'SOL';
    private startupTime: number = 0;
    private isStarting: boolean = true;
    
    // Smooth interpolation state
    private targetPrice: number;
    private displayPrice: number;
    private lastAccelerationTime: number = 0;
    private lastTrendChangeTime: number = 0;
    private lastRandomDirectionTime: number = 0;

    constructor() {
        this.currentPrice = MARKET_PRICES['SOL'];
        this.targetPrice = this.currentPrice;
        this.displayPrice = this.currentPrice;
    }

    subscribe(callback: (price: number) => void): void {
        this.callback = callback;
        this.startSimulation();
    }

    unsubscribe(): void {
        this.stopSimulation();
        this.callback = null;
    }

    getCurrentPrice(): number {
        return this.displayPrice;
    }

    setMarket(market: Market): void {
        this.currentMarket = market;
        const basePrice = MARKET_PRICES[market];
        this.currentPrice = basePrice;
        this.targetPrice = basePrice;
        this.displayPrice = basePrice;
        this.velocity = 0;
        this.trend = 0;
        this.isStarting = true;
        this.startupTime = Date.now();
    }

    private startSimulation(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.lastUpdateTime = Date.now();
        this.startupTime = Date.now();
        this.isStarting = true;
        this.lastAccelerationTime = Date.now();
        this.lastTrendChangeTime = Date.now();
        this.lastRandomDirectionTime = Date.now();

        const loop = () => {
            const now = Date.now();
            const deltaTime = now - this.lastUpdateTime;
            this.lastUpdateTime = now;

            // Get token-specific volatility parameters
            const volatility = TOKEN_VOLATILITY[this.currentMarket];
            
            // Startup phase: gradually increase volatility from 0 to full
            const timeSinceStart = now - this.startupTime;
            let volatilityMultiplier = 1;
            if (this.isStarting && timeSinceStart < PRICE_STARTUP_DURATION_MS) {
                // Smooth transition from 0 to 1 over startup duration
                volatilityMultiplier = Math.pow(timeSinceStart / PRICE_STARTUP_DURATION_MS, 2);
            } else {
                this.isStarting = false;
                volatilityMultiplier = 1;
            }

            // Update trend frequently for dynamic, unpredictable movement
            if (now - this.lastTrendChangeTime >= PRICE_TREND_CHANGE_INTERVAL_MS) {
                // Frequent, weaker trends for more direction changes
                this.trend = (Math.random() - 0.5) * 0.015 * volatilityMultiplier;
                this.lastTrendChangeTime = now;
            }

            // Frequent random direction changes to prevent long trends
            // This makes the price feel alive and unpredictable
            if (now - this.lastRandomDirectionTime >= PRICE_RANDOM_DIRECTION_CHANGE_MS) {
                // Add random counter-force to break sustained movements
                // Stronger when velocity is high to force direction changes
                const velocityFactor = Math.min(Math.abs(this.velocity) / (this.currentPrice * volatility.maxVelocityMultiplier), 1);
                const randomDirectionForce = (Math.random() - 0.5) * this.currentPrice * volatility.volatilityBase * (0.3 + velocityFactor * 0.4) * volatilityMultiplier;
                this.velocity += randomDirectionForce;
                this.lastRandomDirectionTime = now;
            }

            // Apply acceleration at token-specific frequency (more frequent for randomness)
            if (now - this.lastAccelerationTime >= volatility.accelerationFrequency) {
                const volatilityBase = this.currentPrice * volatility.volatilityBase * volatilityMultiplier;
                // Increased randomness - full acceleration range for dynamic movement
                const acceleration = (Math.random() - 0.5) * volatilityBase;
                
                this.velocity += acceleration;
                // Weaker trend influence to allow more random movement
                this.velocity += this.trend * (this.currentPrice * volatility.trendStrength * volatilityMultiplier * 0.5);
                
                this.lastAccelerationTime = now;
            }

            // Anti-trend force: when velocity gets too high, add counter-force
            // This prevents long sustained moves in one direction
            const velocityThreshold = this.currentPrice * volatility.maxVelocityMultiplier * 0.6;
            if (Math.abs(this.velocity) > velocityThreshold) {
                // Add counter-force proportional to excess velocity
                const excessVelocity = Math.abs(this.velocity) - velocityThreshold;
                const counterForce = -Math.sign(this.velocity) * excessVelocity * 0.15;
                this.velocity += counterForce;
            }

            // Apply friction for smooth, snake-like movement
            this.velocity *= volatility.velocityFriction;

            // Clamp velocity to prevent jumps (snake-like smoothness)
            const maxVelocity = this.currentPrice * volatility.maxVelocityMultiplier;
            if (this.velocity > maxVelocity) this.velocity = maxVelocity;
            if (this.velocity < -maxVelocity) this.velocity = -maxVelocity;

            // Update target price (the "real" price we're moving towards)
            this.targetPrice += this.velocity;

            // Hard floor
            if (this.targetPrice < PRICE_FLOOR) {
                this.targetPrice = PRICE_FLOOR;
                this.velocity = Math.abs(this.velocity);
            }

            // Ultra-smooth interpolation: gradually move display price towards target
            // This creates the buttery, cinematic, snake-like gliding movement
            // Extremely low smoothing factor = very slow, gentle, continuous motion
            // The data updates fast, but the visual follows slowly and smoothly
            const priceDiff = this.targetPrice - this.displayPrice;
            const absDiff = Math.abs(priceDiff);
            
            // Adaptive smoothing: slower for larger differences, faster for tiny ones
            // This creates smooth acceleration/deceleration like a snake gliding
            let smoothingFactor: number;
            if (absDiff > this.currentPrice * 0.01) {
                // Large difference: very slow, gentle approach (snake gliding)
                smoothingFactor = 0.015;
            } else if (absDiff > this.currentPrice * 0.001) {
                // Medium difference: slow approach
                smoothingFactor = 0.025;
            } else {
                // Small difference: slightly faster to catch up
                smoothingFactor = 0.04;
            }
            
            // Apply exponential easing for ultra-smooth motion
            // This ensures the line never snaps or jumps, always glides like a snake
            const easedDiff = priceDiff * smoothingFactor;
            this.displayPrice += easedDiff;
            
            // Additional micro-smoothing for perfect continuity
            // When very close, use even gentler movement to prevent micro-jumps
            if (absDiff < this.currentPrice * 0.0001) {
                // Ultra-gentle final approach
                this.displayPrice = this.targetPrice * 0.999 + this.displayPrice * 0.001;
            }

            // Update internal current price for calculations
            this.currentPrice = this.targetPrice;

            // Notify callback with smoothly interpolated price
            if (this.callback) {
                this.callback(this.displayPrice);
            }
        };

        // Use setInterval for millisecond-precision updates
        this.intervalId = setInterval(loop, PRICE_UPDATE_INTERVAL_MS);
    }

    private stopSimulation(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

// Export singleton instance
export const mockPriceService = new MockPriceService();
