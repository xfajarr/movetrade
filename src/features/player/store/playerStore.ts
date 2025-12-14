/**
 * Player Store
 * 
 * Manages player balance and bet history
 */

import { create } from 'zustand';
import { Bet } from '../../../types';
import { DEFAULT_BALANCE } from '../../../config/constants';

interface PlayerStore {
    balance: number;
    history: Bet[];

    updateBalance: (newBalance: number) => void;
    addToHistory: (bet: Bet) => void;
    deductBalance: (amount: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
    balance: DEFAULT_BALANCE,
    history: [],

    updateBalance: (newBalance: number) => {
        set({ balance: newBalance });
    },

    addToHistory: (bet: Bet) => {
        set((state) => ({
            history: [bet, ...state.history]
        }));
    },

    deductBalance: (amount: number) => {
        set((state) => ({
            balance: state.balance - amount
        }));
    },
}));
