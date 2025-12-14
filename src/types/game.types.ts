/**
 * Game-related type definitions
 */

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    NONE = 'NONE'
}

export interface Bet {
    id: string;
    market: string;
    direction: Direction;
    entryPrice: number;
    amount: number;
    leverage: number;
    startTime: number;
    endTime: number;
    outcomePrice: number | null;
    result: 'WIN' | 'LOSS' | 'PENDING';
    payout: number;
}

export interface PlayerState {
    balance: number;
    activeBets: Bet[];
    history: Bet[];
}
