import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID, MOVEMENT_CHAIN_ID, MOVEMENT_RPC_URL, MOVEMENT_NETWORK_NAME } from './env';

// Define Movement chain configuration
const movementChain = {
  id: MOVEMENT_CHAIN_ID,
  name: MOVEMENT_NETWORK_NAME,
  network: 'movement',
  nativeCurrency: {
    name: 'MOVE',
    symbol: 'MOVE',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [MOVEMENT_RPC_URL] },
    public: { http: [MOVEMENT_RPC_URL] },
  },
  blockExplorers: {
    default: { 
      name: 'Movement Explorer', 
      url: MOVEMENT_CHAIN_ID === 30732 
        ? 'https://explorer.testnet.imola.movementlabs.xyz' 
        : 'https://explorer.movementlabs.xyz'
    },
  },
};

interface PrivyConfigProps {
  children: React.ReactNode;
}

export function PrivyConfig({ children }: PrivyConfigProps) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Appearance matching game theme
        appearance: {
          theme: 'dark',
          accentColor: '#FFD700', // Golden color matching the game
          logo: '/logo.png',
          showWalletLoginFirst: false, // Show social/email first for better UX
        },
        
        // Login methods
        loginMethods: ['email', 'google', 'discord', 'wallet'],
        
        // Configure Movement chain
        defaultChain: movementChain,
        supportedChains: [movementChain],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
