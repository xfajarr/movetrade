/**
 * Social Data Hook
 * 
 * Manages leaderboard and tournament data loading
 */

import { useEffect } from 'react';
import { useSocialStore } from '../store/socialStore';

export const useSocialData = () => {
    const { leaderboard, tournaments, loadLeaderboard, loadTournaments, joinTournament } = useSocialStore();

    useEffect(() => {
        // Load initial data
        loadLeaderboard();
        loadTournaments();
    }, [loadLeaderboard, loadTournaments]);

    return {
        leaderboard,
        tournaments,
        joinTournament
    };
};
