# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build Commands

- Use `bun dev` for development (not npm) - project uses Bun as package manager
- Use `bun run build` for production builds
- Use `bun run preview` to preview production build

## Architecture Patterns

### Service Layer Abstraction
- Mock services in `src/services/mock/` are currently active
- Service interfaces defined for future API/blockchain integration
- To swap services, update imports in feature hooks (e.g., `useMarketData.ts`)

### Store Structure
- Feature-based Zustand stores: `src/features/*/store/`
- Legacy compatibility shim: `src/store/useGameStore.ts` (don't use for new code)
- Import stores directly from feature locations, not via legacy shim

### Price Simulation
- Real-time price feed uses `requestAnimationFrame` loop
- Simulation parameters in `src/config/constants.ts`
- Price updates trigger bet resolution automatically

## Code Style

### Import Patterns
- Use `@/*` path aliases for clean imports
- Feature imports: `import { useXStore } from '../features/x/store/xStore'`
- Service imports: `import { mockXService } from '../../../services/mock/mockXService'`

### Environment Variables
- Use `import.meta.env` (not `process.env`) for Vite compatibility
- Feature flags: `ENABLE_MOCK_MODE`, `ENABLE_SOUND` (default true)
- Future API/blockchain vars prepared in `src/config/env.ts`

### TypeScript Configuration
- Target: ES2022 with experimental decorators enabled
- Module resolution: bundler mode
- `allowImportingTsExtensions: true` for .ts imports in .tsx files

## Development Notes

- No test framework configured - tests would need to be added
- No linting setup configured
- Price simulation runs at 60fps via requestAnimationFrame
- Bet duration is 5 seconds (configurable in constants)