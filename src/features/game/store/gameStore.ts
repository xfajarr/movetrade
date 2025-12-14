/**
 * Game Store
 * 
 * Manages active bets and betting configuration
 */

import { create } from 'zustand';
import { Bet, Direction } from '../../../types';
import {
    DEFAULT_BET_AMOUNT,
    DEFAULT_LEVERAGE,
    BET_DURATION_MS
} from '../../../config/constants';
import { useMarketStore } from '../../market/store/marketStore';
import { usePlayerStore } from '../../player/store/playerStore';
import { mockGameService } from '../../../services/mock/mockGameService';

interface GameStore {
    betAmount: number;
    leverage: number;
    betDurationMs: number;
    activeBets: Bet[];

    setBetAmount: (amount: number) => void;
    setLeverage: (leverage: number) => void;
    setBetDuration: (durationMs: number) => void;
    placeBet: (direction: Direction) => void;
    checkAndResolveBets: (currentPrice: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    betAmount: DEFAULT_BET_AMOUNT,
    leverage: DEFAULT_LEVERAGE,
    betDurationMs: BET_DURATION_MS,
    activeBets: [],

    setBetAmount: (amount: number) => set({ betAmount: amount }),
    setLeverage: (leverage: number) => set({ leverage }),
    setBetDuration: (durationMs: number) => set({ betDurationMs: durationMs }),

    placeBet: (direction: Direction) => {
        const state = get();
        const playerStore = usePlayerStore.getState();
        const marketStore = useMarketStore.getState();

        // Check balance
        if (playerStore.balance < state.betAmount) return;

        const now = Date.now();
        const newBet: Bet = {
            id: crypto.randomUUID(),
            market: marketStore.selectedMarket,
            direction,
            entryPrice: marketStore.currentPrice,
            amount: state.betAmount,
            leverage: state.leverage,
            startTime: now,
            endTime: now + state.betDurationMs,
            outcomePrice: null,
            result: 'PENDING',
            payout: 0
        };

        // Deduct balance
        playerStore.deductBalance(state.betAmount);

        set({
            activeBets: [...state.activeBets, newBet]
        });
    },

    checkAndResolveBets: (currentPrice: number) => {
        const state = get();
        const playerStore = usePlayerStore.getState();
        const now = Date.now();
        const nextActiveBets: Bet[] = [];
        let newBalance = playerStore.balance;

        state.activeBets.forEach(bet => {
            if (now >= bet.endTime) {
                // Resolve Bet using service
                const resolution = mockGameService.resolveBet(bet, currentPrice);

                const resolvedBet: Bet = {
                    ...bet,
                    outcomePrice: resolution.outcomePrice,
                    result: resolution.result,
                    payout: resolution.payout
                };

                // Update balance
                const totalReturn = resolution.result === 'WIN' ? bet.amount + resolution.payout : 0;
                newBalance += totalReturn;

                // Add to history
                playerStore.addToHistory(resolvedBet);
            } else {
                nextActiveBets.push(bet);
            }
        });

        // Update player balance if changed
        if (newBalance !== playerStore.balance) {
            playerStore.updateBalance(newBalance);
        }

        set({ activeBets: nextActiveBets });
    },
}));
