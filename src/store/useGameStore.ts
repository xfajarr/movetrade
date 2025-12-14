/**
 * Legacy Store Compatibility Shim
 * 
 * This file maintains backward compatibility with components that still use
 * the old import path: '../store/useGameStore'
 * 
 * All new code should import from the feature stores directly.
 */

export { Direction } from '../types';
export type { Bet, PlayerState, Market, Candle, LeaderboardEntry, Tournament } from '../types';

// For now, just re-export the old store structure
// This allows legacy components to continue working
import { create } from 'zustand';

// Import the actual stores
import { useMarketStore } from '../features/market/store/marketStore';
import { useGameStore as useNewGameStore } from '../features/game/store/gameStore';
import { usePlayerStore } from '../features/player/store/playerStore';
import { useSocialStore } from '../features/social/store/socialStore';

// Create a reactive hook that bridges all stores
export const useGameStore = (selector?: any) => {
    const marketState = useMarketStore();
    const gameState = useNewGameStore();
    const playerState = usePlayerStore();
    const socialState = useSocialStore();

    // Combined state object
    const combinedState = {
        // Market
        currentPrice: marketState.currentPrice,
        startPrice: marketState.startPrice,
        selectedMarket: marketState.selectedMarket,
        setMarket: marketState.setMarket,

        // Game
        betAmount: gameState.betAmount,
        leverage: gameState.leverage,
        betDurationMs: gameState.betDurationMs,
        setBetAmount: gameState.setBetAmount,
        setLeverage: gameState.setLeverage,
        setBetDuration: gameState.setBetDuration,
        placeBet: gameState.placeBet,

        // Player
        player: {
            balance: playerState.balance,
            activeBets: gameState.activeBets,
            history: playerState.history,
        },

        // Social
        leaderboard: socialState.leaderboard,
        tournaments: socialState.tournaments,
        joinTournament: socialState.joinTournament,

        // Legacy method that combines price update and bet resolution
        addPriceTick: (price: number) => {
            marketState.updatePrice(price);
            gameState.checkAndResolveBets(price);
        },
    };

    // If no selector, return full state
    if (!selector) return combinedState;

    // Otherwise apply selector
    return selector(combinedState);
};
