/**
 * Price Management Hook (Hybrid: HTTP API + WebSocket)
 * 
 * Uses HTTP API for initial price fetch when app needs it.
 * Uses WebSocket for streaming real-time price updates.
 * WebSocket URL: wss://data-api.speedtrading.pandora.fun/ws/?EIO=4&transport=websocket
 */

import { useEffect, useState } from 'react';
import { useMarketStore } from '../store/marketStore';
import { useGameStore } from '../../game/store/gameStore';
import { websocketPriceService, type IWebSocketPriceService } from '../../../services/api/websocketPriceService';
import { fetchMarketPrice } from '../../../services/api/priceApi';
import { MARKET_PRICES } from '../../../config/constants';

export const useMarketData = () => {
    const { currentPrice, updatePrice, selectedMarket } = useMarketStore();
    const checkAndResolveBets = useGameStore((state) => state.checkAndResolveBets);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch initial price from HTTP API when market changes
    useEffect(() => {
        const fetchInitialPrice = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const price = await fetchMarketPrice(selectedMarket);
                
                // Update the WebSocket service with initial price
                websocketPriceService.setMarket(selectedMarket);
                
                // Update interpolation engine with initial price
                websocketPriceService.updatePriceFromQuery(price);
                
                // Update store with initial price
                updatePrice(price);
            } catch (err) {
                console.error('Failed to fetch initial price:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch price'));
                // Fallback to default price
                updatePrice(MARKET_PRICES[selectedMarket]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialPrice();
    }, [selectedMarket, updatePrice]);

    // Update WebSocket service when market changes (for streaming)
    useEffect(() => {
        websocketPriceService.setMarket(selectedMarket);
    }, [selectedMarket]);

    // Subscribe to WebSocket price updates for streaming
    useEffect(() => {
        const handlePriceUpdate = (price: number) => {
            updatePrice(price);
            checkAndResolveBets(price);
        };

        // Subscribe to WebSocket price service for real-time streaming
        websocketPriceService.subscribe(handlePriceUpdate);

        return () => {
            websocketPriceService.unsubscribe();
        };
    }, [updatePrice, checkAndResolveBets]);

    return {
        currentPrice,
        isLoading,
        error,
    };
};
