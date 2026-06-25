'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Match, MatchPrediction, Team } from '@/types/tournament';
import { teams as fallbackTeams } from '@/data/teams';
import { getInitialMatches, resolveWinner } from '@/utils/tournamentEngine';

interface LiveTournamentPayload {
  teams: Team[];
  matches: Match[];
  updatedAt: string;
}

interface TournamentStore {
  teams: Team[];
  matches: Match[];
  selectedMatchId: string | null;
  liveDataStatus: 'idle' | 'loading' | 'ready' | 'error';
  liveDataError: string | null;
  liveDataUpdatedAt: string | null;
  selectMatch: (matchId: string | null) => void;
  savePrediction: (matchId: string, prediction: MatchPrediction) => void;
  resetPredictions: () => void;
  refreshLiveData: () => Promise<void>;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      teams: fallbackTeams,
      matches: getInitialMatches(),
      selectedMatchId: null,
      liveDataStatus: 'idle',
      liveDataError: null,
      liveDataUpdatedAt: null,
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
      resetPredictions: () =>
        set({
          teams: fallbackTeams,
          matches: getInitialMatches(),
          selectedMatchId: null,
          liveDataStatus: 'idle',
          liveDataError: null,
          liveDataUpdatedAt: null,
        }),
      refreshLiveData: async () => {
        set({ liveDataStatus: 'loading', liveDataError: null });
        try {
          const response = await fetch('/api/tournament/live', { cache: 'no-store' });
          const payload = (await response.json()) as LiveTournamentPayload | { error?: string };
          if (!response.ok || !('matches' in payload)) {
            throw new Error(
              'error' in payload && payload.error ? payload.error : 'Live data request failed.',
            );
          }
          set({
            teams: payload.teams,
            matches: payload.matches,
            liveDataStatus: 'ready',
            liveDataError: null,
            liveDataUpdatedAt: payload.updatedAt,
          });
        } catch (error) {
          set({
            liveDataStatus: 'error',
            liveDataError: error instanceof Error ? error.message : 'Live data request failed.',
          });
        }
      },
    }),
    {
      name: 'fifa26-predictor',
      partialize: (state) => ({ matches: state.matches, teams: state.teams }),
    },
  ),
);
