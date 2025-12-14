/**
 * WebSocket Price Service
 * 
 * Real-time price updates via WebSocket using Socket.IO
 * WebSocket URL: wss://data-api.speedtrading.pandora.fun/ws/?EIO=4&transport=websocket
 */

import { io, Socket } from 'socket.io-client';
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

// Extended interface for WebSocket service
export interface IWebSocketPriceService extends IPriceService {
    updatePriceFromQuery(price: number): void;
}

// WebSocket URL
// Socket.IO will automatically add EIO=4&transport=websocket query params
const WEBSOCKET_URL = 'https://data-api.speedtrading.pandora.fun';

class WebSocketPriceService implements IWebSocketPriceService {
    private callback: ((price: number) => void) | null = null;
    private currentMarket: Market = 'SOL';
    private socket: Socket | null = null;
    private smoothingIntervalId: ReturnType<typeof setInterval> | number | null = null;
    
    // Interpolation state
    private interpolationState: InterpolationState;
    
    // Connection state
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    
    // Track update frequency
    private lastUpdateTime: number = 0;
    private updateCount: number = 0;
    private updateFrequencyLogInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        const initialPrice = MARKET_PRICES['SOL'];
        this.interpolationState = createInterpolationState(initialPrice);
    }

    subscribe(callback: (price: number) => void): void {
        this.callback = callback;
        this.connectWebSocket();
        this.startSmoothingLoop();
        this.startUpdateFrequencyLogging();
    }

    unsubscribe(): void {
        this.disconnectWebSocket();
        this.stopSmoothingLoop();
        this.stopUpdateFrequencyLogging();
        this.callback = null;
    }

    getCurrentPrice(): number {
        return this.interpolationState.displayPrice;
    }

    /**
     * Update price from external source (HTTP API initial fetch)
     * This method is called when initial price is fetched from HTTP API
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

    setMarket(market: Market): void {
        this.currentMarket = market;
        const basePrice = MARKET_PRICES[market];
        
        // Reset interpolation state for new market
        this.interpolationState = createInterpolationState(basePrice);
        
        // Reconnect WebSocket to subscribe to new market
        if (this.callback) {
            this.disconnectWebSocket();
            this.connectWebSocket();
        }
    }

    /**
     * Connect to WebSocket and subscribe to price updates
     */
    private connectWebSocket(): void {
        if (this.socket?.connected) {
            return;
        }

        // Disconnect existing socket if any
        if (this.socket) {
            this.socket.disconnect();
        }

        // Create new Socket.IO connection
        // Socket.IO v4 with WebSocket transport
        // Note: Browser automatically sets Origin header based on page origin
        // The URL format wss://data-api.speedtrading.pandora.fun/ws/?EIO=4&transport=websocket
        // is handled by Socket.IO - we just need the base URL
        this.socket = io(WEBSOCKET_URL, {
            path: '/ws/', // Socket.IO path
            transports: ['websocket'], // Force WebSocket transport only
            reconnection: true,
            reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            // Socket.IO v4 configuration
            forceNew: false,
            timeout: 20000,
            // Additional options for better compatibility
            autoConnect: true,
            withCredentials: false,
            // Socket.IO v4 uses EIO=4 by default
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('WebSocket connected to SpeedTrading API');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.subscribeToMarket();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.isConnected = false;
        });

        // Listen for 'message' event (Socket.IO format: 42["message", {...}])
        // The actual price data comes in format: {event: "ezmodePriceInfo", data: {ETH: {...}, BTC: {...}, ...}}
        this.socket.on('message', (payload: any) => {
            this.handlePriceUpdate(payload);
        });
    }

    /**
     * Subscribe to market price updates
     * Format: 42["subscribe", "{\"method\":\"ezmodePriceInfo\"}"]
     */
    private subscribeToMarket(): void {
        if (!this.socket?.connected) {
            return;
        }

        // Subscribe to ezmodePriceInfo method
        // Socket.IO format: emit('subscribe', '{"method":"ezmodePriceInfo"}')
        const subscribePayload = JSON.stringify({ method: 'ezmodePriceInfo' });
        this.socket.emit('subscribe', subscribePayload);
        console.log('Subscribed to ezmodePriceInfo');
    }

    /**
     * Handle incoming price update from WebSocket
     * Format: 42["message", {event: "ezmodePriceInfo", data: {ETH: {indexPrice: 3148.62, timestamp: ...}, BTC: {...}, ...}}]
     */
    private handlePriceUpdate(payload: any): void {
        try {
            // Parse Socket.IO message format
            // payload structure: {event: "ezmodePriceInfo", data: {ETH: {indexPrice: ..., timestamp: ...}, ...}}
            if (!payload || typeof payload !== 'object') {
                return;
            }

            // Check if this is an ezmodePriceInfo event
            if (payload.event === 'ezmodePriceInfo' && payload.data) {
                const marketData = payload.data[this.currentMarket];
                
                if (marketData && marketData.indexPrice && marketData.indexPrice > 0) {
                    // EXACT WebSocket price - this is the source of truth
                    const price = marketData.indexPrice;
                    const timestamp = marketData.timestamp; // Server timestamp in seconds
                    const now = Date.now();
                    
                    // Track update frequency
                    this.updateCount++;
                    if (this.lastUpdateTime > 0) {
                        const timeSinceLastUpdate = now - this.lastUpdateTime;
                        // Log update frequency every 10 updates
                        if (this.updateCount % 10 === 0) {
                            const avgInterval = timeSinceLastUpdate / 10;
                            console.log(`[WebSocket] ${this.currentMarket} price updates: ${this.updateCount} received, avg interval: ${avgInterval.toFixed(0)}ms (${(1000/avgInterval).toFixed(1)} updates/sec)`);
                        }
                    }
                    this.lastUpdateTime = now;
                    
                    // Calculate velocity based on actual price change for smooth animation
                    if (this.interpolationState.lastUpdateTime > 0) {
                        const timeSinceLastUpdate = Math.max(1, now - this.interpolationState.lastUpdateTime);
                        const priceChange = price - this.interpolationState.lastPriceUpdate;
                        this.interpolationState.velocity = priceChange / timeSinceLastUpdate;
                        
                        // Clamp velocity to prevent extreme values (but allow real price movements)
                        const maxVelocity = price * 0.00005; // Slightly higher to allow real movements
                        if (this.interpolationState.velocity > maxVelocity) {
                            this.interpolationState.velocity = maxVelocity;
                        }
                        if (this.interpolationState.velocity < -maxVelocity) {
                            this.interpolationState.velocity = -maxVelocity;
                        }
                    }
                    
                    // Update target price with exact WebSocket price
                    // The interpolation engine will animate smoothly toward this exact value
                    this.interpolationState = updateTargetPrice(this.interpolationState, price, now);
                }
            }
        } catch (error) {
            console.warn('Failed to process WebSocket price update:', error, payload);
        }
    }

    /**
     * Disconnect WebSocket
     */
    private disconnectWebSocket(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
    }

    private startSmoothingLoop(): void {
        if (this.smoothingIntervalId) {
            this.stopSmoothingLoop();
        }

        // Run chart animation every 5ms for smooth, slow movement
        const smoothingLoop = () => {
            const now = Date.now();

            // Interpolate price using the animation engine
            const newDisplayPrice = interpolatePrice(this.interpolationState, {}, now);
            
            // Update state
            this.interpolationState.displayPrice = newDisplayPrice;

            // Notify callback
            if (this.callback) {
                this.callback(newDisplayPrice);
            }
        };

        // Start animation loop at 5ms interval (200 updates per second)
        // This ensures smooth, slow movement while running frequently
        this.smoothingIntervalId = setInterval(smoothingLoop, 5);
    }

    private stopSmoothingLoop(): void {
        if (this.smoothingIntervalId) {
            clearInterval(this.smoothingIntervalId);
            this.smoothingIntervalId = null;
        }
    }

    /**
     * Start logging update frequency statistics
     */
    private startUpdateFrequencyLogging(): void {
        this.stopUpdateFrequencyLogging();
        
        // Log statistics every 5 seconds
        this.updateFrequencyLogInterval = setInterval(() => {
            if (this.updateCount > 0 && this.lastUpdateTime > 0) {
                const timeSinceStart = Date.now() - (this.lastUpdateTime - (this.updateCount * 100)); // Rough estimate
                const updatesPerSecond = (this.updateCount / (timeSinceStart / 1000)).toFixed(2);
                const avgInterval = timeSinceStart / this.updateCount;
                
                console.log(`[WebSocket Stats] ${this.currentMarket}: ${this.updateCount} updates received, avg: ${avgInterval.toFixed(0)}ms interval, ~${updatesPerSecond} updates/sec`);
            } else {
                console.log(`[WebSocket Stats] ${this.currentMarket}: No updates received yet`);
            }
        }, 5000);
    }

    /**
     * Stop update frequency logging
     */
    private stopUpdateFrequencyLogging(): void {
        if (this.updateFrequencyLogInterval) {
            clearInterval(this.updateFrequencyLogInterval);
            this.updateFrequencyLogInterval = null;
        }
        this.updateCount = 0;
        this.lastUpdateTime = 0;
    }
}

// Export singleton instance
export const websocketPriceService = new WebSocketPriceService();

