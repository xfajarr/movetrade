/**
 * Social Store
 * 
 * Manages leaderboard and tournament data
 */

import { create } from 'zustand';
import { LeaderboardEntry, Tournament } from '../../../types';
import { mockSocialService } from '../../../services/mock/mockSocialService';

interface SocialStore {
    leaderboard: LeaderboardEntry[];
    tournaments: Tournament[];

    loadLeaderboard: () => Promise<void>;
    loadTournaments: () => Promise<void>;
    joinTournament: (id: string) => void;
    updateTournamentScore: (tournamentId: string, score: number) => Promise<void>;
}

export const useSocialStore = create<SocialStore>((set, get) => ({
    leaderboard: [],
    tournaments: [],

    loadLeaderboard: async () => {
        const leaderboard = await mockSocialService.getLeaderboard();
        set({ leaderboard });
    },

    loadTournaments: async () => {
        const tournaments = await mockSocialService.getTournaments();
        set({ tournaments });
    },

    joinTournament: (id: string) => {
        mockSocialService.joinTournament(id);
        // Reload tournaments to get updated data
        get().loadTournaments();
    },

    updateTournamentScore: async (tournamentId: string, score: number) => {
        await mockSocialService.updateTournamentScore(tournamentId, score);
        // Reload tournaments to get updated data
        await get().loadTournaments();
    },
}));
