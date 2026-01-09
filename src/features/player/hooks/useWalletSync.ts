/**
 * useWalletSync Hook
 * 
 * Syncs wallet balance with player store when wallet is connected
 */

import { useEffect } from 'react';
import { useWallet } from '../../wallet/hooks/useWallet';
import { usePlayerStore } from '../store/playerStore';

export function useWalletSync() {
  const { isConnected, balance } = useWallet();
  const syncFromWallet = usePlayerStore((s) => s.syncFromWallet);
  const setWalletMode = usePlayerStore((s) => s.setWalletMode);

  useEffect(() => {
    if (isConnected && balance > 0) {
      // Sync wallet balance to player store
      syncFromWallet(balance);
    } else {
      // Disable wallet mode when disconnected
      setWalletMode(false);
    }
  }, [isConnected, balance, syncFromWallet, setWalletMode]);
}
