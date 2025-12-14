/**
 * Price API
 * 
 * HTTP API for initial price fetch when app needs it.
 * WebSocket is used for streaming real-time updates.
 */

import { apiClient, CHAIN_ID } from './apiClient';
import { Market } from '../../types';

/**
 * Market data from SpeedTrading API
 */
export interface SpeedTradingMarket {
    marketId: number;
    symbol: string;
    indexPrice: number;
    marketPrice: number;
    longOICap: number;
    shortOICap: number;
    baseFeeRate: number;
    depthFactor: number;
    allowance: boolean;
    penaltyDuration: number;
    skewness: number;
    longOI: number;
    shortOI: number;
    accFundingFactor: number;
    fundingRateUpdateTimestamp: number;
    accProfit: number;
    mmr: number;
    displayDecimal: number;
    takeProfitCap: number;
    minLeverage: number;
    maxLeverage: number;
    initialMarginCap: number;
    fundingRate: number;
    isBlocked: boolean;
    activate: boolean;
    eventMarket: boolean;
    marginStep: number[];
    leverageStep: number[];
    tpStep: number[];
}

/**
 * Response type for markets endpoint
 */
export type MarketsResponse = SpeedTradingMarket[];

/**
 * Fetches all markets from SpeedTrading API
 */
export const fetchMarkets = async (): Promise<MarketsResponse> => {
    const response = await apiClient.get<MarketsResponse>('/moon/markets', {
        params: {
            chainId: CHAIN_ID,
        },
    });
    return response.data;
};

/**
 * Fetches price for a specific market from SpeedTrading API
 * 
 * @param market - The market symbol (BTC, ETH, SOL)
 * @returns The real indexPrice from SpeedTrading API
 * @throws Error if market not found or price is invalid
 */
export const fetchMarketPrice = async (market: Market): Promise<number> => {
    try {
        const markets = await fetchMarkets();
        const marketData = markets.find((m) => m.symbol === market);
        
        if (!marketData) {
            throw new Error(`Market ${market} not found in SpeedTrading API response`);
        }
        
        if (marketData.indexPrice <= 0) {
            throw new Error(`Invalid price for market ${market}: ${marketData.indexPrice}`);
        }
        
        // Return the real price from SpeedTrading API
        return marketData.indexPrice;
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw new Error(`Failed to fetch price for ${market}: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Query keys for React Query (COMMENTED OUT - Using WebSocket)
 */
/*
export const priceQueryKeys = {
    all: ['prices'] as const,
    markets: () => [...priceQueryKeys.all, 'markets'] as const,
    market: (market: Market) => [...priceQueryKeys.all, 'market', market] as const,
};
*/

