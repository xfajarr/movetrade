/**
 * Social features type definitions
 */

export interface LeaderboardEntry {
    rank: number;
    username: string;
    score: number;
    winRate: number;
    isCurrentUser?: boolean;
}

export interface Tournament {
    id: string;
    name: string;
    prizePool: number;
    participants: number;
    endsIn: number; // timestamp
    status: 'LIVE' | 'UPCOMING' | 'ENDED';
    userRank?: number;
    userScore?: number;
}
