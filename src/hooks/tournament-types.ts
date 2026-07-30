import type { AnimeListItem } from '@/types';

export type BracketType = 'winners' | 'losers' | 'final';

export interface TournamentParticipant {
  id: string;
  anime: AnimeListItem;
  seed: number;
  eliminated: boolean;
  finalPosition: number | null;
  losses: 0 | 1 | 2;
  /** True for an empty "TBD" slot awaiting a real participant — never a real anime. */
  isPlaceholder: boolean;
}

export type PairStatus = 'pending' | 'bye' | 'playing' | 'completed';

export interface Pair {
  id: string;
  bracket: BracketType;
  roundInBracket: number;
  pairIndex: number;
  participants: TournamentParticipant[];
  winner: TournamentParticipant | null;
  status: PairStatus;
}

export type TournamentMatch = Pair;

export interface Round {
  index: number;
  bracket: BracketType;
  roundInBracket: number;
  pairs: Pair[];
  isComplete: boolean;
}

export interface BracketMeta {
  winnersRounds: number;
  losersRounds: number;
  hasFinal: true;
}

export interface TournamentState {
  meta: BracketMeta;
  allParticipants: TournamentParticipant[];
  rounds: Round[];
  currentBracket: BracketType;
  currentRoundInBracket: number;
  champion: TournamentParticipant | null;
  runnerUp: TournamentParticipant | null;
  isComplete: boolean;
  roundStarted: boolean;
}

export type TournamentResult = TournamentParticipant & { position: number };
