'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Match, MatchPrediction } from '@/types/tournament';
import { getInitialMatches, resolveWinner } from '@/utils/tournamentEngine';

interface TournamentStore {
  matches: Match[];
  selectedMatchId: string | null;
  selectMatch: (matchId: string | null) => void;
  savePrediction: (matchId: string, prediction: MatchPrediction) => void;
  resetPredictions: () => void;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      matches: getInitialMatches(),
      selectedMatchId: null,
      selectMatch: (matchId) => set({ selectedMatchId: matchId }),
      savePrediction: (matchId, prediction) =>
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === matchId
              ? {
                  ...match,
                  status:
                    prediction.homeScore === null || prediction.awayScore === null
                      ? match.status
                      : 'completed',
                  prediction: { ...prediction, winnerId: resolveWinner(match, prediction) },
                }
              : match,
          ),
          selectedMatchId: null,
        })),
      resetPredictions: () => set({ matches: getInitialMatches(), selectedMatchId: null }),
    }),
    { name: 'fifa26-predictor' },
  ),
);
