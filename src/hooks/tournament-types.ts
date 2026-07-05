import type { AnimeListItem } from '@/types';

/**
 * Участник турнира.
 */
export interface TournamentParticipant {
  id: string;
  anime: AnimeListItem;
  seed: number;
  eliminated: boolean;
  finalPosition: number | null;
}

/**
 * Статус пары участников.
 */
export type PairStatus = 'pending' | 'bye' | 'playing' | 'completed';

/**
 * Пара участников в матче.
 */
export interface Pair {
  id: string;
  roundIndex: number;
  pairIndex: number;
  participants: TournamentParticipant[];
  winner: TournamentParticipant | null;
  status: PairStatus;
}

/**
 * Compatibility alias for TournamentMatch (used by TournamentMatch component).
 */
export type TournamentMatch = Pair;

/**
 * Раунд турнира.
 */
export interface Round {
  index: number;
  pairs: Pair[];
  isComplete: boolean;
}

/**
 * Состояние турнира.
 */
export interface TournamentState {
  allParticipants: TournamentParticipant[];
  rounds: Round[];
  currentRoundIndex: number;
  champion: TournamentParticipant | null;
  isComplete: boolean;
  roundStarted: boolean;
}

/**
 * Результат участника в турнире с присвоенной итоговой позицией.
 */
export type TournamentResult = TournamentParticipant & { position: number };
