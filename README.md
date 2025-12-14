# MoveTrade - Modular Architecture

A modern crypto prediction game built with React, TypeScript, and a modular architecture ready for backend and smart contract integration.

## Project Structure

All source code is in the `src/` directory with a feature-based organization:

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main application
├── config/               # Configuration & constants
├── types/                # TypeScript type definitions
├── features/             # Feature modules (game, market, player, social, ui)
├── services/             # Service layer (mock, api, blockchain)
├── hooks/                # Global custom hooks
├── utils/                # Utility functions
├── components/           # Shared components
└── store/                # Compatibility bridge store
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
bun dev

# Build for production
npm run build
```

## Features

- 🎮 **Real-time price predictions** - Place bets on crypto price movements
- 📊 **Live charts** - Real-time price visualization with TradingView-style charts
- 💰 **Balance management** - Track your wins and losses
- 🏆 **Leaderboards & Tournaments** - Compete with other players
- ⚡ **Modular architecture** - Easy to extend and maintain

## Architecture Highlights

### Feature-Based Modules
Each feature is self-contained:
- **Components**: UI elements
- **Store**: State management (Zustand)
- **Hooks**: Business logic
- **Services**: Data access

### Service Layer
Abstract interfaces for easy integration:
- **Mock Services**: Current development implementation
- **API Services**: Ready for backend integration
- **Blockchain Services**: Ready for smart contract integration

Simply swap the service implementation without changing components.

### Type Safety
Domain-specific TypeScript types ensure compile-time safety and excellent IDE support.

## Adding Backend/Blockchain

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed guides on:
- Integrating with a backend API
- Connecting to smart contracts
- Environment configuration

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- `/src/features/` - Feature-specific code organization
- `/src/services/` - Service layer interfaces and implementations

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lightweight Charts** - Chart visualization

## License

MIT
