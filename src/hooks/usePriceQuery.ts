/**
 * React Query Hook for Price Data
 * 
 * Uses React Query for caching, automatic refetching, and error handling
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Market } from '../types';
import { fetchMarketPrice, fetchMarkets, priceQueryKeys, MarketsResponse } from '../services/api/priceApi';

/**
 * Hook to fetch price for a specific market
 */
export const usePriceQuery = (
    market: Market,
    options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: priceQueryKeys.market(market),
        queryFn: () => fetchMarketPrice(market),
        refetchInterval: 5000, // Refetch every 5 seconds from SpeedTrading API
        staleTime: 4000, // Consider data stale after 4 seconds
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Enable query immediately on mount
        enabled: true,
        // Refetch on mount to get fresh data
        refetchOnMount: true,
        ...options,
    });
};

/**
 * Hook to fetch all markets
 */
export const useMarketsQuery = (
    options?: Omit<UseQueryOptions<MarketsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: priceQueryKeys.markets(),
        queryFn: fetchMarkets,
        refetchInterval: 5000,
        staleTime: 4000,
        retry: 3,
        ...options,
    });
};
