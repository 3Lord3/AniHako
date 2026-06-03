import { describe, it, expect } from 'vitest';
import type {
  TournamentParticipant,
  PairStatus,
  Pair,
  TournamentMatch,
  Round,
  TournamentState,
  TournamentResult,
} from '@/hooks/tournament-types';
import type { AnimeCatalogItem } from '@/types';

const createMockAnime = (id: number): AnimeCatalogItem => ({
  anime_id: id,
  anime_status: { title: 'Вышло', alias: 'released' as const, value: 0 },
  anime_url: `/anime/${id}`,
  poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
  rating: { average: 8.0, counters: 0 },
  title: `Anime ${id}`,
  type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
  year: 2024,
  description: '',
  views: 0,
  season: 1 as const,
  episodes: { aired: 12, count: 12 },
});

describe('tournament-types', () => {
  describe('TournamentParticipant', () => {
    it('accepts valid participant object', () => {
      const participant: TournamentParticipant = {
        id: 'p-1',
        anime: createMockAnime(1),
        seed: 1,
        eliminated: false,
        finalPosition: null,
      };
      expect(participant.id).toBe('p-1');
      expect(participant.seed).toBe(1);
      expect(participant.eliminated).toBe(false);
    });

    it('accepts eliminated participant', () => {
      const participant: TournamentParticipant = {
        id: 'p-1',
        anime: createMockAnime(1),
        seed: 1,
        eliminated: true,
        finalPosition: 3,
      };
      expect(participant.eliminated).toBe(true);
      expect(participant.finalPosition).toBe(3);
    });
  });

  describe('PairStatus', () => {
    it('accepts all valid status values', () => {
      const statuses: PairStatus[] = ['pending', 'bye', 'playing', 'completed'];
      expect(statuses).toContain('pending');
      expect(statuses).toContain('bye');
      expect(statuses).toContain('playing');
      expect(statuses).toContain('completed');
    });
  });

  describe('Pair', () => {
    it('accepts valid pair object', () => {
      const pair: Pair = {
        id: 'round-0-pair-0',
        roundIndex: 0,
        pairIndex: 0,
        participants: [
          { id: 'p-1', anime: createMockAnime(1), seed: 1, eliminated: false, finalPosition: null },
          { id: 'p-2', anime: createMockAnime(2), seed: 2, eliminated: false, finalPosition: null },
        ],
        winner: null,
        status: 'pending',
      };
      expect(pair.id).toBe('round-0-pair-0');
      expect(pair.participants).toHaveLength(2);
      expect(pair.status).toBe('pending');
    });

    it('accepts pair with winner', () => {
      const winner = { id: 'p-1', anime: createMockAnime(1), seed: 1, eliminated: false, finalPosition: null };
      const pair: Pair = {
        id: 'round-0-pair-0',
        roundIndex: 0,
        pairIndex: 0,
        participants: [winner, { id: 'p-2', anime: createMockAnime(2), seed: 2, eliminated: true, finalPosition: null }],
        winner,
        status: 'completed',
      };
      expect(pair.winner).toBe(winner);
      expect(pair.status).toBe('completed');
    });
  });

  describe('TournamentMatch (alias for Pair)', () => {
    it('TournamentMatch is same type as Pair', () => {
      const match: TournamentMatch = {
        id: 'round-0-pair-0',
        roundIndex: 0,
        pairIndex: 0,
        participants: [],
        winner: null,
        status: 'pending',
      };
      expect(match.status).toBe('pending');
    });
  });

  describe('Round', () => {
    it('accepts valid round object', () => {
      const round: Round = {
        index: 0,
        pairs: [],
        isComplete: false,
      };
      expect(round.index).toBe(0);
      expect(round.isComplete).toBe(false);
    });
  });

  describe('TournamentState', () => {
    it('accepts valid tournament state', () => {
      const state: TournamentState = {
        allParticipants: [],
        rounds: [],
        currentRoundIndex: 0,
        champion: null,
        isComplete: false,
        roundStarted: false,
      };
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isComplete).toBe(false);
    });

    it('accepts tournament with champion', () => {
      const champion: TournamentParticipant = {
        id: 'p-1',
        anime: createMockAnime(1),
        seed: 1,
        eliminated: false,
        finalPosition: 1,
      };
      const state: TournamentState = {
        allParticipants: [champion],
        rounds: [],
        currentRoundIndex: 3,
        champion,
        isComplete: true,
        roundStarted: true,
      };
      expect(state.champion).toBe(champion);
      expect(state.isComplete).toBe(true);
    });
  });

  describe('TournamentResult', () => {
    it('accepts valid tournament result', () => {
      const result: TournamentResult = {
        position: 1,
        id: 'p-1',
        anime: createMockAnime(1),
        seed: 1,
        eliminated: false,
        finalPosition: 1,
      };
      expect(result.position).toBe(1);
      expect(result.finalPosition).toBe(1);
    });
  });
});