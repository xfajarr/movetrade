# RacingChart Component

A MotoGP-themed racing visualization that replaces the traditional price chart with an exciting race track where bikes move forward/backward based on real-time price changes.

## Features

### 🏍️ Token-Specific MotoGP Bikes
Each cryptocurrency token has its own unique MotoGP bike image:
- **BTC**: Orange MotoGP bike (`motogp_orange_transparent.png`)
- **ETH**: Blue MotoGP bike (`motogp_blue_transparent.png`)
- **SOL**: Default MotoGP bike (`motogp_1.png`)

### 📊 Price-Based Movement
- **Racer starts at START line** (0%) when bet is placed
- **Forward Movement**: Price increases move the bike forward toward FINISH
- **Backward Movement**: Price decreases move the bike backward toward START
- Position calculated as: `position = priceChange% × 50`
- Sensitivity: 2% price increase = 100% position (reach finish line)
- Movement is smooth with 300ms transitions

### 🏁 Fixed Finish Line
- Finish line is **FIXED** at the end of track (100% position)
- Does NOT move during the race
- Visual checkered flag pattern at the right edge
- Sparkle effects when racer gets close (>85% position)

### 🎯 Real-Time Information Panels

**Left Info Panel:**
- Current bike position (0-100%)
- Distance to finish line (100 - position)
- Current price with formatting
- Price change percentage with directional arrows (↗/↘)
- Active bet direction (🚀 LONG / 📉 SHORT)

**Right Progress Panel:**
- Time progress percentage
- Animated progress bar (blue → purple → pink gradient)
- Time remaining indicator

### 🎨 Visual Effects

1. **Speed Lines**: Animated horizontal lines when price is moving (>0.5% change)
2. **Motion Blur**: Subtle blur effect behind the bike for speed illusion
3. **Glow Effects**: Yellow glow around the bike and finish line
4. **Victory Confetti**: Colorful bouncing particles when bike crosses finish line
5. **Track Elements**:
   - Asphalt texture overlay
   - Track markings every 5%
   - Dashed center line
   - Green START line
   - Animated checkered FINISH flag

## Integration

### Usage in App
```tsx
import { RacingChart } from './components/RacingChart';

<RacingChart />
```

### Store Dependencies
- `useMarketStore`: Gets current price, selected market
- `useGameStore`: Gets active bets, bet duration

## Bet Integration

When a bet is placed:
1. Racer resets to START line (0% position)
2. Start price is locked in
3. Racing mode activates (`isRacing = true`)
4. Finish line appears FIXED at end of track (100%)
5. Bike position updates smoothly based on price changes relative to start price
   - Price UP → Bike moves forward toward finish
   - Price DOWN → Bike moves backward toward start
6. Victory confetti triggers when bike reaches >95% position

## Customization

### Sensitivity Adjustment
Change the `scaleFactor` in the position calculation:
```tsx
const scaleFactor = 50; // Default: 2% price increase = 100% position
```
- Higher value = more sensitive (smaller price moves = bigger position changes)
  - Example: `scaleFactor = 100` → 1% price increase reaches finish line
- Lower value = less sensitive (larger price moves needed)
  - Example: `scaleFactor = 25` → 4% price increase reaches finish line

### Track Appearance
Modify these constants in the component:
- Track width: `w-[90%]`
- Track height: `h-40`
- Bike size: `w-28 h-28`
- Number of track markings: `Array(21)`
- Number of center dashes: `Array(40)`

### Animation Speeds
- Bike transition: `duration-300` (smooth forward/backward movement)
- Finish line: Fixed (no animation)
- Speed line animation: `0.3s - 1.0s` (varies per line)
- Confetti: `0.5s - 1.5s` (varies per particle)

## File Structure
```
RacingChart/
├── RacingChart.tsx    # Main component
├── index.ts          # Export
└── README.md         # This file
```

## Future Enhancements
- [ ] Multiple bikes racing (compare multiple tokens)
- [ ] Lap counter for longer bet durations
- [ ] Crowd sound effects
- [ ] Pit stop animations for bet adjustments
- [ ] Weather effects (rain, fog) based on volatility
- [ ] Replay mode for viewing past races

