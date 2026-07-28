import { describe, it, expect } from 'vitest';
import {
  shuffleArray,
  generatePairId,
  buildTournamentRounds,
  getRoundName,
  winnersRoundsFor,
  losersRoundsFor,
  lbRoundForWbLoss,
  computeLbPairCounts,
} from '@/hooks/tournament-utils';
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

describe('tournament-utils', () => {
  describe('shuffleArray', () => {
    it('returns array of same length', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(shuffleArray(arr)).toHaveLength(5);
    });

    it('contains all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      arr.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('does not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });
  });

  describe('generatePairId', () => {
    it('generates correct pair id format', () => {
      expect(generatePairId('winners', 0, 0)).toBe('winners-r0-p0');
      expect(generatePairId('losers', 1, 2)).toBe('losers-r1-p2');
      expect(generatePairId('final', 0, 0)).toBe('final-r0-p0');
    });
  });

  describe('winnersRoundsFor', () => {
    it('returns correct number of rounds for power of 2', () => {
      expect(winnersRoundsFor(8)).toBe(3);
      expect(winnersRoundsFor(16)).toBe(4);
      expect(winnersRoundsFor(4)).toBe(2);
    });

    it('returns correct number of rounds for non-power of 2', () => {
      expect(winnersRoundsFor(5)).toBe(3);
      expect(winnersRoundsFor(9)).toBe(4);
    });

    it('returns 0 for less than 2 participants', () => {
      expect(winnersRoundsFor(1)).toBe(0);
      expect(winnersRoundsFor(0)).toBe(0);
    });
  });

  describe('losersRoundsFor', () => {
    it('returns correct number of LB rounds', () => {
      expect(losersRoundsFor(4)).toBe(6);
      expect(losersRoundsFor(3)).toBe(4);
      expect(losersRoundsFor(2)).toBe(2);
      expect(losersRoundsFor(1)).toBe(0);
      expect(losersRoundsFor(0)).toBe(0);
    });
  });

  describe('lbRoundForWbLoss', () => {
    it('routes WB losers to correct LB rounds', () => {
      expect(lbRoundForWbLoss(0)).toBe(0);
      expect(lbRoundForWbLoss(1)).toBe(1);
      expect(lbRoundForWbLoss(2)).toBe(3);
      expect(lbRoundForWbLoss(3)).toBe(5);
    });
  });

  describe('computeLbPairCounts', () => {
    it('returns correct pair counts for N=8', () => {
      const counts = computeLbPairCounts(8, 3);
      expect(counts).toHaveLength(4);
      expect(counts[0]).toBe(2);
      expect(counts[1]).toBe(2);
      expect(counts[2]).toBe(1);
      expect(counts[3]).toBe(1);
    });

    it('returns correct pair counts for N=4', () => {
      const counts = computeLbPairCounts(4, 2);
      expect(counts).toHaveLength(2);
      expect(counts[0]).toBe(1);
      expect(counts[1]).toBe(1);
    });

    it('returns empty array for wbRounds=1', () => {
      const counts = computeLbPairCounts(2, 1);
      expect(counts).toHaveLength(0);
    });

    it('accounts for odd-round byes instead of assuming a clean power-of-2 shape', () => {
      // N=17 winners bracket sizes: 17,9,5,3,2,1 -> real WB losers per round: 8,4,2,1,1.
      // A formula that assumes a clean ceil(N/4) halving pattern (ignoring the
      // byes those odd sizes produce) would under- or over-size these rounds,
      // causing real participants to be routed past the end of a round's pairs
      // and silently dropped during advancement.
      const counts = computeLbPairCounts(17, 5);
      expect(counts).toEqual([4, 4, 2, 2, 1, 1, 1, 1]);
    });
  });

  describe('buildTournamentRounds', () => {
    it('creates correct structure for 8 participants', () => {
      const anime = Array.from({ length: 8 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const { rounds, winnersRounds, losersRounds } = buildTournamentRounds(anime);

      expect(winnersRounds).toBe(3);
      expect(losersRounds).toBe(4);

      const wbRounds = rounds.filter(r => r.bracket === 'winners');
      const lbRounds = rounds.filter(r => r.bracket === 'losers');
      const finalRounds = rounds.filter(r => r.bracket === 'final');

      expect(wbRounds).toHaveLength(3);
      expect(lbRounds).toHaveLength(4);
      expect(finalRounds).toHaveLength(1);
    });

    it('assigns seeds starting from 1', () => {
      const anime = Array.from({ length: 4 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const { rounds } = buildTournamentRounds(anime);

      const firstRound = rounds.find(r => r.bracket === 'winners' && r.roundInBracket === 0);
      const seeds = firstRound!.pairs.flatMap(p => p.participants.map(p => p.seed));
      expect(seeds).toContain(1);
      expect(seeds).toContain(2);
      expect(seeds).toContain(3);
      expect(seeds).toContain(4);
    });

    it('does not modify original anime array', () => {
      const anime = Array.from({ length: 4 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const original = [...anime];
      buildTournamentRounds(anime);
      expect(anime).toEqual(original);
    });
  });

  describe('getRoundName', () => {
    it('returns Гранд-финал for final bracket', () => {
      expect(getRoundName('final', 0, 3, 5)).toBe('Гранд-финал');
    });

    it('returns correct names for winners bracket', () => {
      expect(getRoundName('winners', 2, 3, 5)).toBe('Финал');
      expect(getRoundName('winners', 1, 3, 5)).toBe('Полуфинал');
      expect(getRoundName('winners', 0, 3, 5)).toBe('Четвертьфинал');
    });

    it('returns correct names for losers bracket', () => {
      expect(getRoundName('losers', 4, 3, 5)).toBe('Финал');
      expect(getRoundName('losers', 0, 3, 5)).toBe('1 раунд');
      expect(getRoundName('losers', 1, 3, 5)).toBe('2 раунд');
    });
  });
});
