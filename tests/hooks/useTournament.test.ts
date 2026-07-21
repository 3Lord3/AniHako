import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTournament, type Pair } from '@/hooks/useTournament';
import type { AnimeCatalogItem } from '@/types';

const createMockAnime = (id: number, title: string): AnimeCatalogItem => ({
  anime_id: id,
  anime_status: { title: 'Вышло', alias: 'released' as const, value: 0 },
  anime_url: `/anime/${id}`,
  poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
  rating: { average: 8.0, counters: 0 },
  title,
  type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
  year: 2024,
  description: '',
  views: 0,
  season: 1 as const,
  episodes: { aired: 12, count: 12 },
});

const mockAnime5: AnimeCatalogItem[] = [
  createMockAnime(1, 'Anime A'),
  createMockAnime(2, 'Anime B'),
  createMockAnime(3, 'Anime C'),
  createMockAnime(4, 'Anime D'),
  createMockAnime(5, 'Anime E'),
];

const mockAnime9: AnimeCatalogItem[] = [
  createMockAnime(1, 'Anime 1'),
  createMockAnime(2, 'Anime 2'),
  createMockAnime(3, 'Anime 3'),
  createMockAnime(4, 'Anime 4'),
  createMockAnime(5, 'Anime 5'),
  createMockAnime(6, 'Anime 6'),
  createMockAnime(7, 'Anime 7'),
  createMockAnime(8, 'Anime 8'),
  createMockAnime(9, 'Anime 9'),
];

describe('useTournament', () => {
  describe('initialization', () => {
    it('should initialize tournament with 5 participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      expect(result.current.tournament).toBeDefined();
      expect(result.current.tournament!.rounds.length).toBeGreaterThanOrEqual(1);

      const firstRound = result.current.tournament!.rounds[0];
      expect(firstRound.pairs.length).toBe(3);
    });

    it('should initialize tournament with 9 participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime9);
      });

      expect(result.current.tournament).toBeDefined();

      expect(result.current.tournament!.rounds.length).toBeGreaterThanOrEqual(1);
    });

    it('should have one bye pair when odd number of participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      const firstRound = result.current.tournament!.rounds[0];
      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');
      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');

      expect(byePairs.length).toBe(1);
      expect(regularPairs.length).toBe(2);
      expect(regularPairs.every(p => p.participants.length === 2)).toBe(true);
      expect(byePairs[0].participants.length).toBe(1);
    });
  });

  describe('startRound', () => {
    it('should set roundStarted to true and mark pairs as playing', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      expect(result.current.tournament!.roundStarted).toBe(true);

      const firstRound = result.current.tournament!.rounds[0];
      const playingPairs = firstRound.pairs.filter(p => p.status === 'playing');
      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');

      expect(byePairs.length).toBe(1);
      expect(playingPairs.length).toBe(2);
    });
  });

  describe('selectWinner', () => {
    it('should set winner for a pair when selectWinner is called', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      const firstRound = result.current.tournament!.rounds[0];
      const firstPair = firstRound.pairs.find(p => p.participants.length === 2);
      expect(firstPair).toBeDefined();

      const winnerId = firstPair!.participants[0].id;

      act(() => {
        result.current.selectWinner(firstPair!.id, winnerId);
      });

      const updatedPair = result.current.tournament!.rounds[0].pairs.find(p => p.id === firstPair!.id);
      expect(updatedPair!.winner).toBeDefined();
      expect(updatedPair!.winner!.id).toBe(winnerId);
      expect(updatedPair!.status).toBe('completed');
    });

    it('should auto-advance bye participant to next round', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      const firstRound = result.current.tournament!.rounds[0];
      const byePair = firstRound.pairs.find(p => p.status === 'bye');
      expect(byePair).toBeDefined();
      expect(byePair!.winner).toBeDefined();
      expect(byePair!.winner!.id).toBe(byePair!.participants[0].id);
    });

    it('should create next round after all pairs in current round are decided', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      const firstRound = result.current.tournament!.rounds[0];

      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');
      for (const pair of regularPairs) {
        const winnerId = pair.participants[0].id;
        act(() => {
          result.current.selectWinner(pair.id, winnerId);
        });
      }

      const updatedTournament = result.current.tournament;
      expect(
        updatedTournament!.rounds[0].isComplete ||
        updatedTournament!.isComplete ||
        updatedTournament!.rounds.length > 1
      ).toBe(true);
    });
  });

  describe('tournament flow with 9 participants', () => {
    it('should correctly handle bye in first round with 9 participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime9);
      });

      const firstRound = result.current.tournament!.rounds[0];

      expect(firstRound.pairs.length).toBe(5);

      const byePairs = firstRound.pairs.filter(p => p.status === 'bye');
      const regularPairs = firstRound.pairs.filter(p => p.status !== 'bye');

      expect(byePairs.length).toBe(1);
      expect(regularPairs.length).toBe(4);

      expect(regularPairs.every(p => p.participants.length === 2)).toBe(true);

      expect(byePairs[0].participants.length).toBe(1);
      expect(byePairs[0].winner).toBeDefined();
    });

    it('should progress all 9 participants through tournament', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime9);
      });

      act(() => {
        result.current.startRound();
      });

      const round0 = result.current.tournament!.rounds[0];
      for (const pair of round0.pairs) {
        if (pair.status !== 'bye' && !pair.winner) {
          act(() => {
            result.current.selectWinner(pair.id, pair.participants[0].id);
          });
        }
      }

      const updatedTournament = result.current.tournament!;
      expect(
        updatedTournament.rounds[0].isComplete ||
        updatedTournament.isComplete ||
        updatedTournament.rounds.length > 1
      ).toBe(true);
    });
  });

  describe('resetTournament', () => {
    it('should reset tournament state', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      expect(result.current.tournament).toBeDefined();

      act(() => {
        result.current.resetTournament();
      });

      expect(result.current.tournament).toBeNull();
    });
  });

  describe('resetRound', () => {
    it('should reset only current round pairs to pending status', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      const firstRound = result.current.tournament!.rounds[0];
      const firstPair = firstRound.pairs.find(p => p.participants.length === 2);
      const winnerId = firstPair!.participants[0].id;

      act(() => {
        result.current.selectWinner(firstPair!.id, winnerId);
      });

      const updatedPair = result.current.tournament!.rounds[0].pairs.find(p => p.id === firstPair!.id);
      expect(updatedPair!.winner).toBeDefined();
      expect(updatedPair!.status).toBe('completed');

      act(() => {
        result.current.resetRound();
      });

      const resetPair = result.current.tournament!.rounds[0].pairs.find(p => p.id === firstPair!.id);
      expect(resetPair!.winner).toBeNull();
      expect(resetPair!.status).toBe('pending');
    });

    it('should set roundStarted to false', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      expect(result.current.tournament!.roundStarted).toBe(true);

      act(() => {
        result.current.resetRound();
      });

      expect(result.current.tournament!.roundStarted).toBe(false);
    });

    it('should not affect other rounds', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      act(() => {
        result.current.startRound();
      });

      const firstRound = result.current.tournament!.rounds[0];
      const pairs = firstRound.pairs.filter(p => p.participants.length === 2);

      for (const pair of pairs) {
        const winnerId = pair.participants[0].id;
        act(() => {
          result.current.selectWinner(pair.id, winnerId);
        });
      }

      const hasSecondRound = result.current.tournament!.rounds.length > 1;

      act(() => {
        result.current.resetRound();
      });

      if (hasSecondRound) {
        expect(result.current.tournament!.rounds.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('getResults positions', () => {
    const playEntireTournament = (chooseWinnerForPair: (pair: Pair) => string) => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      let safety = 0;
      while (!result.current.tournament?.isComplete && safety < 50) {
        const round = result.current.tournament!.rounds[result.current.tournament!.currentRoundIndex];
        if (!result.current.tournament!.roundStarted) {
          act(() => {
            result.current.startRound();
          });
        }
        for (const pair of round.pairs) {
          if (pair.status === 'pending' || pair.status === 'playing') {
            const winnerId = chooseWinnerForPair(pair);
            act(() => {
              result.current.selectWinner(pair.id, winnerId);
            });
          }
        }
        safety++;
      }

      return result;
    };

    it('should return empty array before tournament is complete', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime5);
      });

      expect(result.current.getResults()).toEqual([]);
    });

    it('should rank the champion at position 1', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      expect(results).toHaveLength(5);

      const sortedByPosition = [...results].sort((a, b) => a.position - b.position);
      expect(sortedByPosition[0].position).toBe(1);
      expect(sortedByPosition[0].id).toBe(result.current.tournament!.champion!.id);
    });

    it('should rank the finalist at position 2', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const finalists = results.filter((p) => p.position === 2);
      expect(finalists).toHaveLength(1);
    });

    it('should give the round-1 loser position 3 (only one real match in round 1 with 5 participants)', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const thirdPlace = results.filter((p) => p.position === 3);
      expect(thirdPlace).toHaveLength(1);
    });

    it('should give round 0 losers tied at position 5', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const fifthPlace = results.filter((p) => p.position === 5);
      expect(fifthPlace).toHaveLength(2);
    });

    it('should reflect actual tournament results, not seed order', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const sortedByPosition = [...results].sort((a, b) => a.position - b.position);

      expect(sortedByPosition.map((p) => p.position)).toEqual([1, 2, 3, 5, 5]);
      expect(sortedByPosition[0].anime.anime_id).toBe(result.current.tournament!.champion!.anime.anime_id);
    });
  });
});
