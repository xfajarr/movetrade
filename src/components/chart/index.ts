/**
 * Chart Module Exports
 * 
 * Clean export interface for the chart module.
 */

// Main component
export { LiveChart } from './LiveChart';
export { default } from './LiveChart';

// Hooks (for advanced usage)
export { useChartAnimation } from './hooks/useChartAnimation';
export { useBetLines } from './hooks/useBetLines';
export { useOutcomeFlash } from './hooks/useOutcomeFlash';

// Types
export * from './types/chartTypes';

// Config (for customization)
export * from './config/chartAnimationConfig';
export * from './config/chartStyleConfig';

// Utils (for reuse)
export * from './utils/curveUtils';
export * from './utils/adaptiveSpeed';
