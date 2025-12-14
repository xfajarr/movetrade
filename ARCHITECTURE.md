# ModulModular Architecture Documentation

## Overview

This project has been refactored from a flat structure to a modular, feature-based architecture. The new structure improves maintainability, testability, and prepares the codebase for backend/smart contract integration.

## Directory Structure

```
movetrade/
├── src/                           # All source code
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Main app component
│   │
│   ├── config/                    # Configuration
│   │   ├── constants.ts           # App constants (bet duration, rates, markets)
│   │   └── env.ts                 # Environment variables
│   │
│   ├── types/                     # Type definitions
│   │   ├── index.ts               # Barrel export
│   │   ├── game.types.ts          # Game types (Bet, PlayerState, Direction)
│   │   ├── market.types.ts        # Market types (Market, Candle)
│   │   ├── social.types.ts        # Social types (Leaderboard, Tournament)
│   │   └── api.types.ts           # API types (future)
│   │
│   ├── features/                  # Feature modules
│   │   ├── game/                  # Game logic
│   │   │   ├── components/        # BetStatus, PredictionButtons
│   │   │   ├── store/             # gameStore.ts
│   │   │   └── hooks/             # Game hooks
│   │   │
│   │   ├── market/                # Market/Charts
│   │   │   ├── components/        # LiveChart, PriceTicker
│   │   │   ├── store/             # marketStore.ts
│   │   │   ├── hooks/             # useMarketData.ts
│   │   │   └── services/          # Price service wrappers
│   │   │
│   │   ├── player/                # Player/Balance
│   │   │   ├── components/        # BalanceDisplay, PlayerHistory
│   │   │   └── store/             # playerStore.ts
│   │   │
│   │   ├── social/                # Social features
│   │   │   ├── components/        # Leaderboard, Tournaments, HistoryList
│   │   │   ├── store/             # socialStore.ts
│   │   │   └── hooks/             # useSocialData.ts
│   │   │
│   │   └── ui/                    # Shared UI
│   │       └── components/        # TopBar, SidePanel, GameSounds
│   │
│   ├── services/                  # Core services (abstraction layer)
│   │   ├── mock/                  # Mock implementations
│   │   │   ├── mockPriceService.ts    # Simulated price feed
│   │   │   ├── mockGameService.ts     # Bet resolution logic
│   │   │   └── mockSocialService.ts   # Leaderboard/tournament data
│   │   │
│   │   ├── api/                   # API integration (future)
│   │   ├── blockchain/            # Blockchain integration (future)
│   │   └── storage/               # Local storage (future)
│   │
│   ├── hooks/                     # Global hooks
│   ├── utils/                     # Utility functions
│   ├── components/                # Shared components
│   └── store/                     # Bridge store for backward compatibility
│
└── index.html                     # HTML entry (points to src/main.tsx)
```

## Key Architectural Patterns

### 1. Feature-Based Organization
Each feature (game, market, player, social) is self-contained with:
- **Components**: UI elements specific to the feature
- **Store**: State management using Zustand
- **Hooks**: Custom hooks encapsulating feature logic
- **Services**: Business logic and data access

### 2. Service Layer Abstraction
Services provide interfaces that can be swapped:
- **Mock Services**: Current implementation for development
- **API Services**: Ready to replace mocks with real backend calls
- **Blockchain Services**: Structure ready for smart contract integration

Example:
```typescript
// Service interface
interface IPriceService {
  subscribe(callback: (price: number) => void): void;
  unsubscribe(): void;
  getCurrentPrice(): number;
}

// Mock implementation (current)
mockPriceService.subscribe((price) => {
  // Simulated price updates
});

// Future API implementation
apiPriceService.subscribe((price) => {
  // Real-time WebSocket price updates
});
```

### 3. Centralized Configuration
All constants and environment variables are centralized:
- `src/config/constants.ts`: Game parameters, market prices, default values
- `src/config/env.ts`: API endpoints, contract addresses, feature flags

### 4. Type Safety
Types are organized by domain:
- Game types: Betting, directions, player state
- Market types: Markets, price data
- Social types: Leaderboards, tournaments
- API types: Request/response shapes (future)

## State Management

### Before (Monolithic)
```typescript
// One large store with everything
useGameStore((state) => ({
  currentPrice: state.currentPrice,
  balance: state.player.balance,
  betAmount: state.betAmount,
  leaderboard: state.leaderboard,
  // ... everything mixed together
}));
```

### After (Modular)
```typescript
// Feature-specific stores
const currentPrice = useMarketStore((state) => state.currentPrice);
const balance = usePlayerStore((state) => state.balance);
const betAmount = useGameStore((state) => state.betAmount);
const leaderboard = useSocialStore((state) => state.leaderboard);
```

## How to Add New Features

### Adding a Backend API

1. **Create API Service Implementation**:
```typescript
// src/services/api/apiPriceService.ts
class ApiPriceService implements IPriceService {
  private ws: WebSocket;
  
  subscribe(callback: (price: number) => void) {
    this.ws = new WebSocket(WS_URL);
    this.ws.onmessage = (event) => {
      callback(JSON.parse(event.data).price);
    };
  }
  
  // ... implement interface
}
```

2. **Switch Service in Hook**:
```typescript
// src/features/market/hooks/useMarketData.ts
import { apiPriceService } from '../../../services/api/apiPriceService';

export const useMarketData = () => {
  useEffect(() => {
    apiPriceService.subscribe(handlePriceUpdate); // Changed from mock
    return () => apiPriceService.unsubscribe();
  }, []);
};
```

### Adding Smart Contract Integration

1. **Create Contract Service**:
```typescript
// src/services/blockchain/contractService.ts
export class ContractService {
  async placeBet(amount: number, direction: Direction) {
    const tx = await this.contract.placeBet({
      amount,
      direction,
    });
    return await tx.wait();
  }
}
```

2. **Update Game Store**:
```typescript
placeBet: async (direction: Direction) => {
  // Instead of mock logic
  const tx = await contractService.placeBet(state.betAmount, direction);
  // Handle transaction result
}
```

## Benefits

### Maintainability
- **Clear Boundaries**: Each feature is isolated
- **Single Responsibility**: Modules have one clear purpose
- **Easy Navigation**: Find code by searching feature directories

### Scalability
- **Service Swapping**: Replace mocks with real implementations
- **Independent Development**: Work on features without conflicts
- **Code Reuse**: Shared utilities and components

### Testing
- **Isolated Units**: Test features independently
- **Mock Dependencies**: Services can be easily mocked
- **Type Safety**: Catch errors at compile time

### Developer Experience
- **Onboarding**: New developers understand structure quickly
- **IDE Support**: Better autocomplete with modular imports
- **Refactoring**: Changes are localized to modules

## Running the App

```bash
# Development
bun dev

# Build
bun run build

# Preview production build
bun run preview
```

## Environment Variables

Create a `.env.local` file for configuration:

```env
# API (Future)
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Blockchain (Future)
VITE_BLOCKCHAIN_NETWORK=devnet
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_RPC_ENDPOINT=https://api.devnet.solana.com

# Feature Flags
VITE_ENABLE_MOCK_MODE=true
VITE_ENABLE_SOUND=true
```

## Questions?

For questions about the architecture or how to extend it, see:
- `implementation_plan.md`: Detailed migration plan
- Feature-specific README files (coming soon)
- Code comments in service interfaces
