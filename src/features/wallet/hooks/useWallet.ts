/**
 * useWallet Hook
 * 
 * Custom hook that wraps Privy hooks and syncs wallet state
 */

import { useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWalletStore } from '../store/walletStore';
import { createPublicClient, http, formatEther } from 'viem';
import { MOVEMENT_CHAIN_ID, MOVEMENT_RPC_URL } from '../../../config/env';

// Create public client for Movement blockchain
const publicClient = createPublicClient({
  chain: {
    id: MOVEMENT_CHAIN_ID,
    name: 'Movement',
    network: 'movement',
    nativeCurrency: { name: 'MOVE', symbol: 'MOVE', decimals: 18 },
    rpcUrls: {
      default: { http: [MOVEMENT_RPC_URL] },
      public: { http: [MOVEMENT_RPC_URL] },
    },
  },
  transport: http(),
});

export function useWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const walletStore = useWalletStore();
  
  // Find EVM embedded wallet
  const embeddedWallet = useMemo(() => 
    wallets.find(w => w.walletClientType === 'privy' && w.chainType === 'ethereum'),
    [wallets]
  );
  
  // Fetch balance function
  const fetchBalance = async (address: string) => {
    try {
      walletStore.setLoading(true);
      const balance = await publicClient.getBalance({ address: address as `0x${string}` });
      const balanceInMove = parseFloat(formatEther(balance));
      walletStore.setBalance(balanceInMove);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      walletStore.setLoading(false);
    }
  };
  
  // Sync state to store
  useEffect(() => {
    if (embeddedWallet) {
      walletStore.setConnected(embeddedWallet.address);
      // Fetch and update balance
      fetchBalance(embeddedWallet.address);
      
      // Poll balance every 10 seconds
      const interval = setInterval(() => {
        fetchBalance(embeddedWallet.address);
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      walletStore.setDisconnected();
    }
  }, [embeddedWallet]);
  
  return {
    isReady: ready,
    isConnected: authenticated,
    wallet: embeddedWallet,
    address: embeddedWallet?.address,
    balance: walletStore.moveBalance,
    isLoading: walletStore.isLoading,
    login,
    logout,
    user,
    refreshBalance: embeddedWallet ? () => fetchBalance(embeddedWallet.address) : undefined,
  };
}
