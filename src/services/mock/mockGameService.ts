/**
 * Mock Game Service
 * 
 * Business logic for bet management and resolution.
 * This will be replaced with backend API calls in production.
 */

import { Bet, Direction } from '../../types';
import { BASE_PROFIT_RATE, LEVERAGE_BONUS_RATE } from '../../config/constants';

export interface BetResolution {
    result: 'WIN' | 'LOSS';
    payout: number;
    outcomePrice: number;
}

export interface IGameService {
    resolveBet(bet: Bet, currentPrice: number): BetResolution;
    calculatePayout(bet: Bet, isWin: boolean): number;
}

class MockGameService implements IGameService {
    resolveBet(bet: Bet, currentPrice: number): BetResolution {
        const entry = bet.entryPrice;
        const dir = bet.direction;

        const isWin =
            (dir === Direction.UP && currentPrice > entry) ||
            (dir === Direction.DOWN && currentPrice < entry);

        const payout = this.calculatePayout(bet, isWin);

        return {
            result: isWin ? 'WIN' : 'LOSS',
            payout,
            outcomePrice: currentPrice
        };
    }

    calculatePayout(bet: Bet, isWin: boolean): number {
        if (!isWin) return 0;

        const leverageBonus = bet.leverage * LEVERAGE_BONUS_RATE;
        const effectiveRate = BASE_PROFIT_RATE + leverageBonus;

        return bet.amount * effectiveRate;
    }
}

// Export singleton instance
export const mockGameService = new MockGameService();
