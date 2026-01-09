/**
 * Wallet Store
 * 
 * Manages wallet connection state and balance for Movement blockchain
 */

import { create } from 'zustand';

interface WalletStore {
    // State
    isConnected: boolean;
    walletAddress: string | null;
    moveBalance: number; // MOVE token balance
    isLoading: boolean;
    
    // Actions
    setConnected: (address: string) => void;
    setDisconnected: () => void;
    setBalance: (balance: number) => void;
    setLoading: (loading: boolean) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    isConnected: false,
    walletAddress: null,
    moveBalance: 0,
    isLoading: false,
    
    setConnected: (address: string) => {
        set({ isConnected: true, walletAddress: address });
    },
    
    setDisconnected: () => {
        set({ isConnected: false, walletAddress: null, moveBalance: 0 });
    },
    
    setBalance: (balance: number) => {
        set({ moveBalance: balance });
    },
    
    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },
}));
