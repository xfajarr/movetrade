/**
 * Market-related type definitions
 */

export type Market = 'BTC' | 'ETH' | 'SOL';

export interface Candle {
    time: number;
    value: number;
}

export interface MarketData {
    market: Market;
    currentPrice: number;
    priceHistory: Candle[];
    startPrice: number;
}
