/**
 * Mock Social Service
 * 
 * Provides mock data for leaderboard and tournaments.
 * This will be replaced with backend API in production.
 */

import { LeaderboardEntry, Tournament } from '../../types';

export interface ISocialService {
    getLeaderboard(): Promise<LeaderboardEntry[]>;
    getTournaments(): Promise<Tournament[]>;
    updateTournamentScore(tournamentId: string, score: number): Promise<void>;
}

class MockSocialService implements ISocialService {
    private leaderboard: LeaderboardEntry[] = [
        { rank: 1, username: 'NeonWhale', score: 254000, winRate: 82 },
        { rank: 2, username: 'SatoshiGhost', score: 189500, winRate: 75 },
        { rank: 3, username: 'CyberPunk_X', score: 142000, winRate: 68 },
        { rank: 4, username: 'MoonRider', score: 98000, winRate: 61 },
        { rank: 5, username: 'PixelTrader', score: 85000, winRate: 59 },
        { rank: 42, username: 'YOU', score: 5000, winRate: 100, isCurrentUser: true },
    ];

    private tournaments: Tournament[] = [
        {
            id: '1',
            name: 'Midnight Blitz',
            prizePool: 50000,
            participants: 1240,
            endsIn: Date.now() + 3600000,
            status: 'LIVE'
        },
        {
            id: '2',
            name: 'Solana Summer',
            prizePool: 250000,
            participants: 8500,
            endsIn: Date.now() + 86400000,
            status: 'UPCOMING'
        },
    ];

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        // Simulate API delay
        return Promise.resolve([...this.leaderboard]);
    }

    async getTournaments(): Promise<Tournament[]> {
        // Simulate API delay
        return Promise.resolve([...this.tournaments]);
    }

    async updateTournamentScore(tournamentId: string, additionalScore: number): Promise<void> {
        // Update tournament score (mock implementation)
        this.tournaments = this.tournaments.map(t => {
            if (t.id === tournamentId && t.status === 'LIVE' && t.userRank !== undefined) {
                const currentScore = t.userScore || 0;
                const newScore = currentScore + additionalScore;

                // Simulate ranking improvement
                const rankImprovement = Math.floor(additionalScore / 50);
                const newRank = Math.max(1, t.userRank - rankImprovement);

                return { ...t, userScore: newScore, userRank: newRank };
            }
            return t;
        });
    }

    // Method to join tournament (for UI)
    joinTournament(tournamentId: string): void {
        this.tournaments = this.tournaments.map(t => {
            if (t.id === tournamentId && t.userRank === undefined) {
                return {
                    ...t,
                    participants: t.participants + 1,
                    userRank: t.participants + 1,
                    userScore: 0
                };
            }
            return t;
        });
    }
}

// Export singleton instance
export const mockSocialService = new MockSocialService();
