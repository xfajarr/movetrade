/**
 * WalletButton Component
 * 
 * Main connect/disconnect button with sleek styling
 */

import React, { useState } from 'react';
import { useWallet } from '../../features/wallet/hooks/useWallet';

export const WalletButton: React.FC = () => {
  const { isReady, isConnected, address, login, logout, balance } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isReady) {
    return (
      <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-not-allowed opacity-50">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-sm font-bold text-white">Loading...</span>
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 hover:from-[#FFD700]/40 hover:to-[#FFA500]/40 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-[#FFD700]/50 hover:border-[#FFD700] text-sm font-black text-white transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Connect Wallet
      </button>
    );
  }

  // Connected state
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-green-500/50 hover:border-green-400 text-sm font-black text-white transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
        <span className="font-mono">{truncatedAddress}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Backdrop */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}

      {/* Dropdown */}
      <div
        className={`
          absolute top-full right-0 mt-2 w-64 bg-[#0a0f18] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden
          transition-all duration-200 origin-top-right
          ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="p-4 border-b border-white/10">
          <div className="text-xs text-gray-400 mb-1">Balance</div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            {balance.toFixed(4)}
            <span className="text-sm text-[#FFD700]">MOVE</span>
          </div>
        </div>

        <div className="p-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(address || '');
              setIsDropdownOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-bold text-gray-300 group-hover:text-white">Copy Address</span>
          </button>

          <button
            onClick={() => {
              logout();
              setIsDropdownOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors text-left group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-bold text-gray-300 group-hover:text-red-400">Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
