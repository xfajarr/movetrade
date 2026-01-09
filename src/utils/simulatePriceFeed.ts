
import { useMarketStore } from '../features/market/store/marketStore';

let animationFrameId: number;

export const startPriceSimulation = () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Simulation parameters
  let velocity = 0;
  let trend = 0;
  let frameCount = 0;

  const loop = () => {
    const state = useMarketStore.getState();
    let currentPrice = state.currentPrice;

    frameCount++;

    // Randomize trend occasionally (slower trend changes)
    if (frameCount % 300 === 0) { // Slower trend shifts (every 5s approx)
      trend = (Math.random() - 0.5) * 0.02;
    }

    // Adjust volatility based on price magnitude (crypto moves in %)
    // Tuned for "0.8ms" feel: Smooth but with visible movement
    const volatilityBase = currentPrice * 0.000008; 
    const acceleration = (Math.random() - 0.5) * volatilityBase;
    
    velocity += acceleration;
    velocity += trend * (currentPrice * 0.000002); 
    
    // Friction keeps it smooth (damps velocity)
    velocity *= 0.95; 

    currentPrice += velocity;

    // Hard floor
    if (currentPrice < 0.01) {
        currentPrice = 0.01;
        velocity = Math.abs(velocity);
    }

    // Push update
    state.updatePrice(currentPrice);

    animationFrameId = requestAnimationFrame(loop);
  };

  loop();
};

export const stopPriceSimulation = () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
};
