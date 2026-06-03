import { describe, it, expect } from 'vitest';
import {
  shuffleArray,
  generatePairId,
  createPairsForRound,
  buildTournamentRounds,
  getRoundName,
} from '@/hooks/tournament-utils';
import type { TournamentParticipant } from '@/hooks/tournament-types';
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

const createParticipant = (id: string, anime: AnimeCatalogItem, seed: number): TournamentParticipant => ({
  id,
  anime,
  seed,
  eliminated: false,
  finalPosition: null,
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
      expect(generatePairId(0, 0)).toBe('round-0-pair-0');
      expect(generatePairId(1, 2)).toBe('round-1-pair-2');
      expect(generatePairId(3, 5)).toBe('round-3-pair-5');
    });
  });

  describe('createPairsForRound', () => {
    it('pairs up participants correctly', () => {
      const anime = [1, 2, 3, 4].map(id => createMockAnime(id, `Anime ${id}`));
      const participants = anime.map((a, i) => createParticipant(`p-${i}`, a, i + 1));

      const pairs = createPairsForRound(participants, 0);

      expect(pairs).toHaveLength(2);
      expect(pairs[0].participants).toHaveLength(2);
      expect(pairs[1].participants).toHaveLength(2);
    });

    it('handles odd number of participants with bye', () => {
      const anime = [1, 2, 3].map(id => createMockAnime(id, `Anime ${id}`));
      const participants = anime.map((a, i) => createParticipant(`p-${i}`, a, i + 1));

      const pairs = createPairsForRound(participants, 0);

      expect(pairs).toHaveLength(2);
      const byePair = pairs.find(p => p.status === 'bye');
      const regularPair = pairs.find(p => p.status !== 'bye');

      expect(byePair).toBeDefined();
      expect(byePair!.participants).toHaveLength(1);
      expect(byePair!.winner).toBe(byePair!.participants[0]);
      expect(regularPair!.participants).toHaveLength(2);
    });

    it('sets correct round and pair indices', () => {
      const anime = [1, 2, 3, 4].map(id => createMockAnime(id, `Anime ${id}`));
      const participants = anime.map((a, i) => createParticipant(`p-${i}`, a, i + 1));

      const pairs = createPairsForRound(participants, 2);

      pairs.forEach((pair, index) => {
        expect(pair.roundIndex).toBe(2);
        expect(pair.pairIndex).toBe(index);
        expect(pair.id).toBe(`round-2-pair-${index}`);
      });
    });
  });

  describe('buildTournamentRounds', () => {
    it('creates correct number of rounds for power of 2', () => {
      const anime = Array.from({ length: 8 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const rounds = buildTournamentRounds(anime);

      expect(rounds).toHaveLength(3);
    });

    it('creates correct number of rounds for non-power of 2', () => {
      const anime = Array.from({ length: 5 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const rounds = buildTournamentRounds(anime);

      expect(rounds.length).toBeGreaterThanOrEqual(1);
    });

    it('assigns seeds starting from 1', () => {
      const anime = Array.from({ length: 4 }, (_, i) => createMockAnime(i + 1, `Anime ${i + 1}`));
      const rounds = buildTournamentRounds(anime);

      const firstRound = rounds[0];
      const seeds = firstRound.pairs.flatMap(p => p.participants.map(p => p.seed));
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
    it('returns Финал for last round', () => {
      expect(getRoundName(2, 3)).toBe('Финал');
      expect(getRoundName(0, 1)).toBe('Финал');
    });

    it('returns Полуфинал for 2 round tournament first round', () => {
      expect(getRoundName(0, 2)).toBe('Полуфинал');
    });

    it('returns Полуфинал for totalRounds 3 and roundIndex totalRounds-1', () => {
      expect(getRoundName(2, 3)).toBe('Финал');
      expect(getRoundName(1, 3)).toBe('Полуфинал');
    });

    it('returns Четвертьфинал for correct round', () => {
      expect(getRoundName(1, 3)).toBe('Полуфинал');
      expect(getRoundName(0, 3)).toBe('Четвертьфинал');
    });

    it('returns numbered round for regular rounds', () => {
      expect(getRoundName(0, 5)).toBe('1 раунд');
      expect(getRoundName(1, 5)).toBe('2 раунд');
      expect(getRoundName(3, 5)).toBe('Полуфинал');
    });
  });
});