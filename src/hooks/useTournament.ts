import { useState, useCallback } from 'react';
import type { AnimeListItem } from '@/types';
import {
  type TournamentState,
  type TournamentParticipant,
  type TournamentResult,
} from './tournament-types';
import {
  buildTournamentRounds,
  createPairsForRound,
} from './tournament-utils';

export type { TournamentParticipant, Pair, Round, TournamentState, TournamentResult } from './tournament-types';
export type { PairStatus } from './tournament-types';
export { getRoundName } from './tournament-utils';

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  const initializeTournament = useCallback((animeList: AnimeListItem[]) => {
    if (animeList.length < 2) return;

    const rounds = buildTournamentRounds(animeList);

    // Только участники первого раунда (в последующих placeholder'ы)
    const allParticipants: TournamentParticipant[] = [];
    rounds[0].pairs.forEach(pair => {
      pair.participants.forEach(p => {
        if (!allParticipants.find(ap => ap.id === p.id)) {
          allParticipants.push(p);
        }
      });
    });

    const newTournament: TournamentState = {
      allParticipants,
      rounds,
      currentRoundIndex: 0,
      champion: null,
      isComplete: false,
      roundStarted: false,
    };

    setTournament(newTournament);
    setCurrentPairIndex(0);
  }, []);

  const startRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;

      const updatedPairs = prev.rounds[prev.currentRoundIndex].pairs.map(pair => {
        if (pair.status === 'pending' && pair.participants.length === 2) {
          return { ...pair, status: 'playing' as const };
        }
        return pair;
      });

      const updatedRounds = [...prev.rounds];
      updatedRounds[prev.currentRoundIndex] = {
        ...updatedRounds[prev.currentRoundIndex],
        pairs: updatedPairs,
      };

      return { ...prev, rounds: updatedRounds, roundStarted: true };
    });

    setCurrentPairIndex(0);
  }, []);

  const selectWinner = useCallback((pairId: string, winnerId: string) => {
    setTournament(prev => {
      if (!prev) return prev;

      const currentRound = prev.rounds[prev.currentRoundIndex];
      const pairIndex = currentRound.pairs.findIndex(p => p.id === pairId);
      if (pairIndex === -1) return prev;

      const pair = currentRound.pairs[pairIndex];
      const winner = pair.participants.find(p => p.id === winnerId);
      if (!winner) return prev;

      const updatedPair = { ...pair, winner, status: 'completed' as const };
      const updatedPairs = [...currentRound.pairs];
      updatedPairs[pairIndex] = updatedPair;

      const allPairsDecided = updatedPairs.every(p =>
        p.status === 'completed' || p.status === 'bye'
      );

      let nextRoundIndex = prev.currentRoundIndex;
      const updatedRounds = [...prev.rounds];
      let isComplete = false;
      let champion = prev.champion;

      updatedRounds[prev.currentRoundIndex] = {
        ...updatedRounds[prev.currentRoundIndex],
        pairs: updatedPairs,
      };

      if (allPairsDecided) {
        updatedRounds[prev.currentRoundIndex].isComplete = true;

        const winners = updatedPairs.map(p => {
          if (p.status === 'bye') return p.participants[0];
          return p.winner;
        }).filter((w): w is TournamentParticipant => w !== null);

        if (winners.length === 1) {
          isComplete = true;
          champion = winners[0];
        } else {
          const nextRoundPairs = createPairsForRound(winners, prev.currentRoundIndex + 1);
          nextRoundIndex = prev.currentRoundIndex + 1;

          while (updatedRounds.length <= nextRoundIndex) {
            updatedRounds.push({
              index: updatedRounds.length,
              pairs: [],
              isComplete: false,
            });
          }

          updatedRounds[nextRoundIndex] = {
            index: nextRoundIndex,
            pairs: nextRoundPairs,
            isComplete: false,
          };
        }
      }

      return {
        ...prev,
        rounds: updatedRounds,
        currentRoundIndex: nextRoundIndex,
        isComplete,
        champion,
        roundStarted: !allPairsDecided,
      };
    });
  }, []);

  const getResults = useCallback((): TournamentResult[] => {
    if (!tournament) return [];

    const sorted = [...tournament.allParticipants].sort((a, b) => {
      if (tournament.champion && a.id === tournament.champion.id) return -1;
      if (tournament.champion && b.id === tournament.champion.id) return 1;
      return a.seed - b.seed;
    });

    return sorted.map((p, index) => ({
      ...p,
      position: index + 1,
    }));
  }, [tournament]);

  const resetRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;

      const updatedRounds = prev.rounds.map((round, idx) => {
        if (idx === prev.currentRoundIndex) {
          return {
            ...round,
            pairs: round.pairs.map(pair => ({
              ...pair,
              winner: null,
              status: pair.participants.length === 2 ? 'pending' : pair.status,
            })),
          };
        }
        return round;
      });

      return {
        ...prev,
        rounds: updatedRounds,
        roundStarted: false,
      };
    });
  }, []);

  const resetTournament = useCallback(() => {
    setTournament(null);
    setCurrentPairIndex(0);
  }, []);

  return {
    tournament,
    currentPairIndex,
    initializeTournament,
    startRound,
    selectWinner,
    getResults,
    resetTournament,
    resetRound,
  };
}