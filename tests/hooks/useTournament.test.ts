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

const mockAnime4: AnimeCatalogItem[] = [
  createMockAnime(1, 'Anime A'),
  createMockAnime(2, 'Anime B'),
  createMockAnime(3, 'Anime C'),
  createMockAnime(4, 'Anime D'),
];

const mockAnime8: AnimeCatalogItem[] = Array.from({ length: 8 }, (_, i) =>
  createMockAnime(i + 1, `Anime ${i + 1}`)
);

describe('useTournament', () => {
  describe('initialization', () => {
    it('should initialize tournament with 4 participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
      });

      expect(result.current.tournament).toBeDefined();
      expect(result.current.tournament!.meta.winnersRounds).toBe(2);
      expect(result.current.tournament!.meta.losersRounds).toBe(2);

      const wbRounds = result.current.tournament!.rounds.filter(r => r.bracket === 'winners');
      expect(wbRounds).toHaveLength(2);
    });

    it('should initialize tournament with 8 participants', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime8);
      });

      expect(result.current.tournament).toBeDefined();
      expect(result.current.tournament!.meta.winnersRounds).toBe(3);
      expect(result.current.tournament!.meta.losersRounds).toBe(4);
    });
  });

  describe('startRound', () => {
    it('should set roundStarted to true and mark pairs as playing', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
      });

      act(() => {
        result.current.startRound();
      });

      expect(result.current.tournament!.roundStarted).toBe(true);

      const wbRound0 = result.current.tournament!.rounds.find(
        r => r.bracket === 'winners' && r.roundInBracket === 0
      );
      const playingPairs = wbRound0!.pairs.filter(p => p.status === 'playing');
      expect(playingPairs.length).toBe(2);
    });
  });

  describe('selectWinner', () => {
    it('should set winner for a pair when selectWinner is called', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
      });

      act(() => {
        result.current.startRound();
      });

      const wbRound0 = result.current.tournament!.rounds.find(
        r => r.bracket === 'winners' && r.roundInBracket === 0
      );
      const firstPair = wbRound0!.pairs.find(p => p.participants.length === 2);
      expect(firstPair).toBeDefined();

      const winnerId = firstPair!.participants[0].id;

      act(() => {
        result.current.selectWinner(firstPair!.id, winnerId);
      });

      const updatedPair = result.current.tournament!.rounds
        .find(r => r.bracket === 'winners' && r.roundInBracket === 0)!
        .pairs.find(p => p.id === firstPair!.id);
      expect(updatedPair!.winner).toBeDefined();
      expect(updatedPair!.winner!.id).toBe(winnerId);
      expect(updatedPair!.status).toBe('completed');
    });
  });

  describe('resetTournament', () => {
    it('should reset tournament state', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
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
        result.current.initializeTournament(mockAnime4);
      });

      act(() => {
        result.current.startRound();
      });

      const wbRound0 = result.current.tournament!.rounds.find(
        r => r.bracket === 'winners' && r.roundInBracket === 0
      );
      const firstPair = wbRound0!.pairs.find(p => p.participants.length === 2);
      const winnerId = firstPair!.participants[0].id;

      act(() => {
        result.current.selectWinner(firstPair!.id, winnerId);
      });

      const updatedPair = result.current.tournament!.rounds
        .find(r => r.bracket === 'winners' && r.roundInBracket === 0)!
        .pairs.find(p => p.id === firstPair!.id);
      expect(updatedPair!.winner).toBeDefined();
      expect(updatedPair!.status).toBe('completed');

      act(() => {
        result.current.resetRound();
      });

      const resetPair = result.current.tournament!.rounds
        .find(r => r.bracket === 'winners' && r.roundInBracket === 0)!
        .pairs.find(p => p.id === firstPair!.id);
      expect(resetPair!.winner).toBeNull();
      expect(resetPair!.status).toBe('pending');
    });

    it('should set roundStarted to false', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
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
  });

  describe('getResults positions', () => {
    const playEntireTournament = (chooseWinnerForPair: (pair: Pair) => string) => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
      });

      let safety = 0;
      while (!result.current.tournament?.isComplete && safety < 100) {
        const currentRound = result.current.tournament!.rounds.find(
          r => r.bracket === result.current.tournament!.currentBracket &&
               r.roundInBracket === result.current.tournament!.currentRoundInBracket
        );
        
        if (!result.current.tournament!.roundStarted) {
          act(() => {
            result.current.startRound();
          });
        }
        
        if (currentRound) {
          for (const pair of currentRound.pairs) {
            if (pair.status === 'pending' || pair.status === 'playing') {
              if (pair.participants.length === 2 && pair.participants.every(p => p.id && !p.id.includes('TBD'))) {
                const winnerId = chooseWinnerForPair(pair);
                act(() => {
                  result.current.selectWinner(pair.id, winnerId);
                });
              }
            }
          }
        }
        safety++;
      }

      return result;
    };

    it('should return empty array before tournament is complete', () => {
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(mockAnime4);
      });

      expect(result.current.getResults()).toEqual([]);
    });

    it('should rank the champion at position 1', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      expect(results).toHaveLength(4);

      const sortedByPosition = [...results].sort((a, b) => a.position - b.position);
      expect(sortedByPosition[0].position).toBe(1);
      expect(sortedByPosition[0].id).toBe(result.current.tournament!.champion!.id);
    });

    it('should rank the runnerUp at position 2', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const runnerUp = results.find((p) => p.position === 2);
      expect(runnerUp).toBeDefined();
      expect(runnerUp!.id).toBe(result.current.tournament!.runnerUp!.id);
    });

    it('should give all participants unique positions', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const positions = results.map(r => r.position);
      const uniquePositions = new Set(positions);
      
      expect(uniquePositions.size).toBe(positions.length);
    });

    it('should have positions from 1 to N', () => {
      const result = playEntireTournament((pair) => pair.participants[0].id);

      const results = result.current.getResults();
      const positions = results.map(r => r.position).sort((a, b) => a - b);

      expect(positions[0]).toBe(1);
      expect(positions[1]).toBe(2);
      expect(positions[2]).toBeGreaterThanOrEqual(3);
      expect(positions[3]).toBeGreaterThan(positions[2]);
    });
  });

  describe('full simulation for non-power-of-2 participant counts', () => {
    const playToCompletion = (n: number) => {
      const animeList: AnimeCatalogItem[] = Array.from({ length: n }, (_, i) =>
        createMockAnime(i + 1, `Anime ${i + 1}`)
      );
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(animeList);
      });

      let safety = 0;
      while (!result.current.tournament?.isComplete && safety < 200) {
        if (!result.current.tournament!.roundStarted) {
          act(() => {
            result.current.startRound();
          });
        }

        const currentRound = result.current.tournament!.rounds.find(
          r => r.bracket === result.current.tournament!.currentBracket &&
               r.roundInBracket === result.current.tournament!.currentRoundInBracket
        );

        if (currentRound) {
          for (const pair of currentRound.pairs) {
            if (pair.status === 'playing' && !pair.winner) {
              const winnerId = pair.participants[0].id;
              act(() => {
                result.current.selectWinner(pair.id, winnerId);
              });
            }
          }
        }
        safety++;
      }

      return result;
    };

    // Every one of these sizes forces at least one round in the winners or
    // losers bracket to be entirely byes, or a bracket round built from
    // placeholders with an odd leftover slot — the exact conditions that used
    // to make matches play against an empty "TBD" opponent, hang forever
    // waiting on a match with nothing playable, or silently lose a real
    // participant so the final standings had gaps and duplicate positions.
    it.each([3, 5, 6, 9, 10, 11, 12, 17, 18, 21, 22])(
      'completes with every participant assigned a unique position for N=%i',
      (n) => {
        const result = playToCompletion(n);

        expect(result.current.tournament?.isComplete).toBe(true);

        const results = result.current.getResults();
        expect(results).toHaveLength(n);

        const positions = results.map(r => r.position).sort((a, b) => a - b);
        expect(positions).toEqual(Array.from({ length: n }, (_, i) => i + 1));

        const uniqueIds = new Set(results.map(r => r.id));
        expect(uniqueIds.size).toBe(n);
      }
    );

    it('never lets a placeholder "TBD" slot become part of a playable match', () => {
      const result = playToCompletion(17);

      for (const round of result.current.tournament!.rounds) {
        for (const pair of round.pairs) {
          if (pair.status === 'playing' || pair.status === 'completed') {
            expect(pair.participants.every(p => !p.isPlaceholder)).toBe(true);
          }
        }
      }
    });

    it('interleaves LB survivors with fresh WB losers in a major LB round, instead of pairing each group against itself', () => {
      // 8 participants: WB round0 has 4 losers (self-paired in LB round0, a
      // minor round). LB round1 is a major round where LB round0's 2 winners
      // should each face one of WB round1's 2 fresh losers — not the two LB
      // survivors playing each other while the two fresh losers play each other.
      const animeList: AnimeCatalogItem[] = Array.from({ length: 8 }, (_, i) =>
        createMockAnime(i + 1, `Anime ${i + 1}`)
      );
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(animeList);
      });

      let safety = 0;
      while (!result.current.tournament?.isComplete && safety < 50) {
        if (!result.current.tournament!.roundStarted) {
          act(() => {
            result.current.startRound();
          });
        }
        const t = result.current.tournament!;
        const round = t.rounds.find(
          r => r.bracket === t.currentBracket && r.roundInBracket === t.currentRoundInBracket
        );
        if (round) {
          for (const pair of round.pairs) {
            if (pair.status === 'playing' && !pair.winner) {
              const winnerId = pair.participants[0].id;
              act(() => {
                result.current.selectWinner(pair.id, winnerId);
              });
            }
          }
        }
        safety++;
      }

      const t = result.current.tournament!;
      const wb0Losers = new Set(
        t.rounds
          .find(r => r.bracket === 'winners' && r.roundInBracket === 0)!
          .pairs.filter(p => p.status === 'completed')
          .map(p => p.participants.find(x => x.id !== p.winner!.id)!.id)
      );
      const wb1Losers = new Set(
        t.rounds
          .find(r => r.bracket === 'winners' && r.roundInBracket === 1)!
          .pairs.filter(p => p.status === 'completed')
          .map(p => p.participants.find(x => x.id !== p.winner!.id)!.id)
      );
      const lb1 = t.rounds.find(r => r.bracket === 'losers' && r.roundInBracket === 1)!;

      for (const pair of lb1.pairs) {
        const ids = pair.participants.map(p => p.id);
        expect(ids.filter(id => wb0Losers.has(id))).toHaveLength(1);
        expect(ids.filter(id => wb1Losers.has(id))).toHaveLength(1);
      }
    });
  });

  describe('resetRound with a bye pair', () => {
    it('leaves a single-slot bye pair untouched instead of nulling its winner without a way to replay it', () => {
      // Odd participant count so WB round0 has a genuine single-slot bye pair.
      const animeList: AnimeCatalogItem[] = Array.from({ length: 5 }, (_, i) =>
        createMockAnime(i + 1, `Anime ${i + 1}`)
      );
      const { result } = renderHook(() => useTournament());

      act(() => {
        result.current.initializeTournament(animeList);
      });
      act(() => {
        result.current.startRound();
      });

      const round0Before = result.current.tournament!.rounds.find(
        r => r.bracket === 'winners' && r.roundInBracket === 0
      )!;
      const byePairBefore = round0Before.pairs.find(p => p.participants.length === 1)!;
      expect(byePairBefore.status).toBe('bye');
      expect(byePairBefore.winner).not.toBeNull();

      act(() => {
        result.current.resetRound();
      });

      const round0After = result.current.tournament!.rounds.find(
        r => r.bracket === 'winners' && r.roundInBracket === 0
      )!;
      const byePairAfter = round0After.pairs.find(p => p.id === byePairBefore.id)!;
      expect(byePairAfter.status).toBe('bye');
      expect(byePairAfter.winner).toEqual(byePairBefore.winner);
    });
  });
});
