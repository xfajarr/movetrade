/**
 * Real Price Service (Refactored)
 * 
 * Modern implementation using React Query for data fetching
 * and separated interpolation engine for clean architecture.
 * 
 * This service now acts as a bridge between React Query and
 * the interpolation engine, maintaining the existing interface
 * for backward compatibility.
 */

import { Market } from '../../types';
import { MARKET_PRICES } from '../../config/constants';
import {
    createInterpolationState,
    updateTargetPrice,
    interpolatePrice,
    type InterpolationState,
} from '../animation/priceInterpolation';

export interface IPriceService {
    subscribe(callback: (price: number) => void): void;
    unsubscribe(): void;
    getCurrentPrice(): number;
    setMarket(market: Market): void;
}

class RealPriceService implements IPriceService {
    private callback: ((price: number) => void) | null = null;
    private currentMarket: Market = 'SOL';
    private smoothingIntervalId: ReturnType<typeof setInterval> | number | null = null;
    
    // Interpolation state
    private interpolationState: InterpolationState;
    
    // External price update handler (set by React Query hook)
    private externalPriceUpdateHandler: ((price: number) => void) | null = null;

    constructor() {
        const initialPrice = MARKET_PRICES['SOL'];
        this.interpolationState = createInterpolationState(initialPrice);
        
        // Note: Real price will be fetched by React Query hook
        // and updated via updatePriceFromQuery() method
    }

    /**
     * Subscribe to price updates
     * Note: This is now primarily for backward compatibility.
     * The actual price fetching is handled by React Query hooks.
     */
    subscribe(callback: (price: number) => void): void {
        this.callback = callback;
        this.startSmoothingLoop();
    }

    unsubscribe(): void {
        this.stopSmoothingLoop();
        this.callback = null;
    }

    getCurrentPrice(): number {
        return this.interpolationState.displayPrice;
    }

    setMarket(market: Market): void {
        this.currentMarket = market;
        const basePrice = MARKET_PRICES[market];
        
        // Reset interpolation state for new market
        this.interpolationState = createInterpolationState(basePrice);
        
        // Restart smoothing loop if subscribed
        if (this.callback) {
            this.stopSmoothingLoop();
            this.startSmoothingLoop();
        }
    }

    /**
     * Update price from external source (React Query)
     * This method is called by the React Query hook when new data arrives
     */
    updatePriceFromQuery(price: number): void {
        const now = Date.now();
        
        // Calculate velocity for smooth transitions
        if (this.interpolationState.lastUpdateTime > 0) {
            const timeSinceLastUpdate = Math.max(1, now - this.interpolationState.lastUpdateTime);
            const priceChange = price - this.interpolationState.lastPriceUpdate;
            this.interpolationState.velocity = priceChange / timeSinceLastUpdate;
            
            // Clamp velocity to prevent extreme values
            const maxVelocity = price * 0.00002;
            if (this.interpolationState.velocity > maxVelocity) {
                this.interpolationState.velocity = maxVelocity;
            }
            if (this.interpolationState.velocity < -maxVelocity) {
                this.interpolationState.velocity = -maxVelocity;
            }
        }
        
        // Update target price with curve smoothing
        this.interpolationState = updateTargetPrice(this.interpolationState, price, now);
    }

    /**
     * Set external price update handler
     * This allows React Query hooks to register for price updates
     */
    setExternalPriceUpdateHandler(handler: (price: number) => void): void {
        this.externalPriceUpdateHandler = handler;
    }

    private startSmoothingLoop(): void {
        if (this.smoothingIntervalId) {
            this.stopSmoothingLoop();
        }

        let lastLoopTime = Date.now();
        let animationFrameId: number | null = null;

        const smoothingLoop = () => {
            const now = Date.now();
            lastLoopTime = now;

            // Interpolate price using the animation engine
            const newDisplayPrice = interpolatePrice(this.interpolationState, {}, now);
            
            // Update state
            this.interpolationState.displayPrice = newDisplayPrice;

            // Notify callbacks
            if (this.callback) {
                this.callback(newDisplayPrice);
            }
            
            if (this.externalPriceUpdateHandler) {
                this.externalPriceUpdateHandler(newDisplayPrice);
            }

            // Continue animation loop
            if (typeof requestAnimationFrame !== 'undefined') {
                animationFrameId = requestAnimationFrame(smoothingLoop);
                this.smoothingIntervalId = animationFrameId;
            } else {
                this.smoothingIntervalId = setInterval(smoothingLoop, 1);
            }
        };

        // Start animation loop
        if (typeof requestAnimationFrame !== 'undefined') {
            animationFrameId = requestAnimationFrame(smoothingLoop);
            this.smoothingIntervalId = animationFrameId;
        } else {
            this.smoothingIntervalId = setInterval(smoothingLoop, 1);
        }
    }

    private stopSmoothingLoop(): void {
        if (this.smoothingIntervalId) {
            if (typeof cancelAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.smoothingIntervalId as number);
            } else {
                clearInterval(this.smoothingIntervalId);
            }
            this.smoothingIntervalId = null;
        }
    }
}

// Export singleton instance
export const realPriceService = new RealPriceService();
