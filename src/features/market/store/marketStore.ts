/**
 * Market Store
 * 
 * Manages market selection and price data
 */

import { create } from 'zustand';
import { Market } from '../../../types';
import { MARKET_PRICES, DEFAULT_MARKET } from '../../../config/constants';
// COMMENTED OUT: HTTP API service - now using WebSocket
// import { realPriceService } from '../../../services/api/realPriceService';
import { websocketPriceService } from '../../../services/api/websocketPriceService';

interface MarketStore {
    selectedMarket: Market;
    currentPrice: number;
    startPrice: number; // For calculating 24h change

    setMarket: (market: Market) => void;
    updatePrice: (price: number) => void;
    setStartPrice: (price: number) => void; // Manually set start price (e.g. from API)
}

export const useMarketStore = create<MarketStore>((set, get) => ({
    selectedMarket: DEFAULT_MARKET,
    currentPrice: MARKET_PRICES[DEFAULT_MARKET],
    startPrice: MARKET_PRICES[DEFAULT_MARKET] * 0.966, // Simulate a +3.4% start

    setMarket: (market: Market) => {
        const basePrice = MARKET_PRICES[market];
        // Randomize start price slightly to simulate different day changes
        const randomChange = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%

        set({
            selectedMarket: market,
            currentPrice: basePrice,
            startPrice: basePrice / randomChange
        });

        // Notify WebSocket price service to switch markets
        websocketPriceService.setMarket(market);
    },

    updatePrice: (price: number) => {
        set({ currentPrice: price });
    },

    setStartPrice: (price: number) => {
        set({ startPrice: price });
    },
}));
