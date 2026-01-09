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
    isWalletMode: boolean; // Track if using real wallet balance

    updateBalance: (newBalance: number) => void;
    addToHistory: (bet: Bet) => void;
    deductBalance: (amount: number) => void;
    syncFromWallet: (moveBalance: number) => void; // Sync from wallet
    setWalletMode: (enabled: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
    balance: DEFAULT_BALANCE,
    history: [],
    isWalletMode: false,

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

    syncFromWallet: (moveBalance: number) => {
        set({ balance: moveBalance, isWalletMode: true });
    },

    setWalletMode: (enabled: boolean) => {
        set({ isWalletMode: enabled });
    },
}));
