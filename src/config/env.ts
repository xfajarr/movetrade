/**
 * Environment Configuration
 * 
 * Configuration for different environments and external services.
 * Prepared for future backend/blockchain integration.
 */

// API Configuration (Future)
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
export const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3000';

// Blockchain Configuration (Future)
export const BLOCKCHAIN_NETWORK = (import.meta as any).env?.VITE_BLOCKCHAIN_NETWORK || 'devnet';
export const CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '';
export const RPC_ENDPOINT = (import.meta as any).env?.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com';

// Privy Configuration
export const PRIVY_APP_ID = (import.meta as any).env?.VITE_PRIVY_APP_ID || 'cmjfx3ytl00i9l80dgsv3fole';

// Movement Blockchain Configuration
export const MOVEMENT_CHAIN_ID = parseInt((import.meta as any).env?.VITE_MOVEMENT_CHAIN_ID || '30732');
export const MOVEMENT_RPC_URL = (import.meta as any).env?.VITE_MOVEMENT_RPC_URL || 'https://mevm.testnet.imola.movementlabs.xyz';
export const MOVEMENT_NETWORK_NAME = (import.meta as any).env?.VITE_MOVEMENT_NETWORK_NAME || 'Movement EVM Testnet';

// Feature Flags
export const ENABLE_MOCK_MODE = (import.meta as any).env?.VITE_ENABLE_MOCK_MODE !== 'false'; // default true
export const ENABLE_SOUND = (import.meta as any).env?.VITE_ENABLE_SOUND !== 'false'; // default true

// Development
export const IS_DEV = (import.meta as any).env?.DEV;
export const IS_PROD = (import.meta as any).env?.PROD;
