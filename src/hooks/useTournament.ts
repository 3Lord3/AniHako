import { useState, useCallback } from 'react';
import type { AnimeListItem } from '@/types';
import {
  type TournamentState,
  type TournamentParticipant,
  type TournamentResult,
  type Round,
  type BracketType,
  type BracketMeta,
  type Pair,
} from './tournament-types';
import {
  buildTournamentRounds,
  lbRoundForWbLoss,
} from './tournament-utils';

export type { TournamentParticipant, Pair, Round, TournamentState, TournamentResult, BracketType } from './tournament-types';
export { getRoundName } from './tournament-utils';

function findRound(rounds: Round[], bracket: BracketType, roundInBracket: number): Round | undefined {
  return rounds.find(r => r.bracket === bracket && r.roundInBracket === roundInBracket);
}

function advanceParticipant(
  rounds: Round[],
  bracket: BracketType,
  roundInBracket: number,
  targetPairIndex: number,
  targetSlot: 0 | 1,
  participant: TournamentParticipant
): Round[] {
  const targetRound = findRound(rounds, bracket, roundInBracket);
  if (!targetRound) return rounds;

  const targetPair = targetRound.pairs[targetPairIndex];
  if (!targetPair) return rounds;

  const newParticipants = [...targetPair.participants];
  newParticipants[targetSlot] = participant;

  // A pair built with a single (possibly placeholder) slot is pre-resolved as a
  // 'bye'. When a real participant lands there via routing, participants[] gets
  // updated but winner would otherwise keep pointing at whatever it was before
  // (null, or a stale placeholder) — re-sync it.
  const isSingleSlotBye = targetPair.participants.length === 1;
  const newPairs = [...targetRound.pairs];
  newPairs[targetPairIndex] = isSingleSlotBye
    ? { ...targetPair, participants: newParticipants, winner: newParticipants[0], status: 'bye' }
    : { ...targetPair, participants: newParticipants };

  const newRounds = [...rounds];
  const roundIdx = newRounds.findIndex(r => r.bracket === bracket && r.roundInBracket === roundInBracket);
  if (roundIdx === -1) return rounds;
  newRounds[roundIdx] = { ...targetRound, pairs: newPairs };

  return newRounds;
}

/** Self-pairing chunk addressing: consecutive source pairIndex values fill target pairs front-to-back, two per pair. */
function chunkedTarget(pairIndex: number): { targetPairIndex: number; targetSlot: 0 | 1 } {
  return { targetPairIndex: Math.floor(pairIndex / 2), targetSlot: (pairIndex % 2) as 0 | 1 };
}

/** LB round j is "major" (interleaves LB survivors with fresh WB losers) on odd j; "minor" (self-pairing) on even j, including j=0. */
function isMajorLbRound(roundInBracket: number): boolean {
  return roundInBracket % 2 === 1;
}

function isPairDecided(pair: Pair): boolean {
  return pair.status === 'completed' || pair.status === 'bye';
}

/** Marks pending pairs as playing (both real) or bye (0-1 real participants), same rule startRound used to apply once. */
function assignByes(round: Round): Round {
  const pairs = round.pairs.map(pair => {
    if (pair.status !== 'pending' || pair.participants.length !== 2) return pair;
    const realCount = pair.participants.filter(p => !p.isPlaceholder).length;
    if (realCount === 2) {
      return { ...pair, status: 'playing' as const };
    }
    if (realCount === 1) {
      const realParticipant = pair.participants.find(p => !p.isPlaceholder) ?? null;
      return { ...pair, status: 'bye' as const, winner: realParticipant };
    }
    return { ...pair, status: 'bye' as const, winner: null };
  });
  return { ...round, pairs };
}

function routeWinner(
  rounds: Round[],
  meta: BracketMeta,
  bracket: BracketType,
  roundInBracket: number,
  pairIndex: number,
  winner: TournamentParticipant
): Round[] {
  if (bracket === 'winners') {
    const nextWbRound = roundInBracket + 1;
    if (nextWbRound < meta.winnersRounds) {
      const { targetPairIndex, targetSlot } = chunkedTarget(pairIndex);
      return advanceParticipant(rounds, 'winners', nextWbRound, targetPairIndex, targetSlot, winner);
    }
    if (meta.losersRounds > 0) {
      return advanceParticipant(rounds, 'final', 0, 0, 0, winner);
    }
    return rounds;
  }
  if (bracket === 'losers') {
    const nextLbRound = roundInBracket + 1;
    if (nextLbRound < meta.losersRounds) {
      // A survivor moving into a major round gets its own dedicated pair
      // (slot 0), reserved for the fresh WB loser routeLoser will place at
      // slot 1 — a plain chunked address would instead pair survivors against
      // each other two-at-a-time, skipping the interleave entirely.
      if (isMajorLbRound(nextLbRound)) {
        return advanceParticipant(rounds, 'losers', nextLbRound, pairIndex, 0, winner);
      }
      const { targetPairIndex, targetSlot } = chunkedTarget(pairIndex);
      return advanceParticipant(rounds, 'losers', nextLbRound, targetPairIndex, targetSlot, winner);
    }
    return advanceParticipant(rounds, 'final', 0, 0, 1, winner);
  }
  return rounds;
}

function routeLoser(
  rounds: Round[],
  meta: BracketMeta,
  bracket: BracketType,
  roundInBracket: number,
  pairIndex: number,
  loser: TournamentParticipant
): Round[] {
  if (bracket !== 'winners') return rounds;
  const lbRound = lbRoundForWbLoss(roundInBracket);
  if (lbRound >= meta.losersRounds) return rounds;
  // Round 0 only ever receives WB round-0 losers (no prior LB survivors to
  // interleave with), so they simply self-pair. Every other target is a major
  // round: this fresh loser takes slot 1 of its own dedicated pair, matching
  // the survivor routeWinner placed at slot 0 of the same pairIndex.
  if (lbRound === 0) {
    const { targetPairIndex, targetSlot } = chunkedTarget(pairIndex);
    return advanceParticipant(rounds, 'losers', lbRound, targetPairIndex, targetSlot, loser);
  }
  return advanceParticipant(rounds, 'losers', lbRound, pairIndex, 1, loser);
}

interface SettleResult {
  rounds: Round[];
  nextBracket: BracketType;
  nextRoundInBracket: number;
  isComplete: boolean;
  champion: TournamentParticipant | null;
  runnerUp: TournamentParticipant | null;
}

/** Finalizes a fully-decided round: routes bye winners onward and computes where the tournament goes next. */
function settleRound(
  rounds: Round[],
  meta: BracketMeta,
  bracket: BracketType,
  roundInBracket: number,
  champion: TournamentParticipant | null,
  runnerUp: TournamentParticipant | null
): SettleResult | null {
  const round = findRound(rounds, bracket, roundInBracket);
  if (!round || !round.pairs.every(isPairDecided)) return null;

  let updatedRounds = [...rounds];
  const roundIdx = updatedRounds.findIndex(r => r.bracket === bracket && r.roundInBracket === roundInBracket);
  updatedRounds[roundIdx] = { ...updatedRounds[roundIdx], isComplete: true };

  round.pairs.forEach((pair, idx) => {
    if (pair.status === 'bye' && pair.winner) {
      updatedRounds = routeWinner(updatedRounds, meta, bracket, roundInBracket, idx, pair.winner);
    }
  });

  const isFinal = bracket === 'final';
  const isWbOnlyFinal = bracket === 'winners' && roundInBracket === meta.winnersRounds - 1 && meta.losersRounds === 0;

  if (isFinal || isWbOnlyFinal) {
    const finalPair = round.pairs[0];
    const finalWinner = finalPair.winner;
    const finalRunnerUp = finalWinner
      ? finalPair.participants.find(p => p.id !== finalWinner.id) ?? null
      : null;
    return {
      rounds: updatedRounds,
      nextBracket: bracket,
      nextRoundInBracket: roundInBracket,
      isComplete: true,
      champion: finalWinner,
      runnerUp: finalRunnerUp,
    };
  }

  let nextBracket: BracketType = bracket;
  let nextRoundInBracket = roundInBracket;
  if (bracket === 'winners') {
    if (roundInBracket + 1 < meta.winnersRounds) {
      nextRoundInBracket = roundInBracket + 1;
    } else {
      nextBracket = 'losers';
      nextRoundInBracket = 0;
    }
  } else if (bracket === 'losers') {
    if (roundInBracket + 1 < meta.losersRounds) {
      nextRoundInBracket = roundInBracket + 1;
    } else {
      nextBracket = 'final';
      nextRoundInBracket = 0;
    }
  }

  return { rounds: updatedRounds, nextBracket, nextRoundInBracket, isComplete: false, champion, runnerUp };
}

/**
 * Assumes the current round's pairs already reflect real user actions (byes
 * assigned via startRound, or a match just completed via selectWinner). If the
 * round is now fully decided, settles it and moves to the next round. Whenever
 * that next round turns out to have no real matches at all (every pair would
 * be a bye), it is auto-started and settled too — otherwise a round with zero
 * playable matches would never advance, since there'd be nothing for the user
 * to click. Stops as soon as a round has a real match to play, or the
 * tournament completes.
 */
function settleAndCascade(state: TournamentState): TournamentState {
  let rounds = state.rounds;
  let { currentBracket, currentRoundInBracket, champion, runnerUp, isComplete } = state;
  let roundStarted = state.roundStarted;

  while (!isComplete) {
    const round = findRound(rounds, currentBracket, currentRoundInBracket);
    if (!round || !round.pairs.every(isPairDecided)) break;

    const settled = settleRound(rounds, state.meta, currentBracket, currentRoundInBracket, champion, runnerUp);
    if (!settled) break;

    rounds = settled.rounds;
    currentBracket = settled.nextBracket;
    currentRoundInBracket = settled.nextRoundInBracket;
    isComplete = settled.isComplete;
    champion = settled.champion;
    runnerUp = settled.runnerUp;
    roundStarted = false;

    if (isComplete) break;

    const nextRound = findRound(rounds, currentBracket, currentRoundInBracket);
    if (!nextRound) break;

    const withByes = assignByes(nextRound);
    const hasPlayable = withByes.pairs.some(p => p.status === 'playing');
    if (hasPlayable) break;

    rounds = rounds.map(r =>
      r.bracket === currentBracket && r.roundInBracket === currentRoundInBracket ? withByes : r
    );
  }

  return { ...state, rounds, currentBracket, currentRoundInBracket, champion, runnerUp, isComplete, roundStarted };
}

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  const initializeTournament = useCallback((animeList: AnimeListItem[]) => {
    if (animeList.length < 2) return;

    const { rounds, winnersRounds, losersRounds } = buildTournamentRounds(animeList);

    const allParticipants: TournamentParticipant[] = [];
    const firstRound = rounds.find(r => r.bracket === 'winners' && r.roundInBracket === 0);
    if (firstRound) {
      firstRound.pairs.forEach(pair => {
        pair.participants.forEach(p => {
          if (!allParticipants.find(ap => ap.id === p.id)) {
            allParticipants.push(p);
          }
        });
      });
    }

    const newTournament: TournamentState = {
      meta: { winnersRounds, losersRounds, hasFinal: true },
      allParticipants,
      rounds,
      currentBracket: 'winners',
      currentRoundInBracket: 0,
      champion: null,
      runnerUp: null,
      isComplete: false,
      roundStarted: false,
    };

    setTournament(newTournament);
    setCurrentPairIndex(0);
  }, []);

  const startRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;

      const round = findRound(prev.rounds, prev.currentBracket, prev.currentRoundInBracket);
      if (!round) return prev;

      const withByes = assignByes(round);
      const rounds = prev.rounds.map(r =>
        r.bracket === prev.currentBracket && r.roundInBracket === prev.currentRoundInBracket ? withByes : r
      );

      return settleAndCascade({ ...prev, rounds, roundStarted: true });
    });

    setCurrentPairIndex(0);
  }, []);

  const selectWinner = useCallback((pairId: string, winnerId: string) => {
    setTournament(prev => {
      if (!prev) return prev;

      const currentRound = findRound(prev.rounds, prev.currentBracket, prev.currentRoundInBracket);
      if (!currentRound) return prev;

      const pairIndex = currentRound.pairs.findIndex(p => p.id === pairId);
      if (pairIndex === -1) return prev;

      const pair = currentRound.pairs[pairIndex];
      const winner = pair.participants.find(p => p.id === winnerId);
      if (!winner) return prev;

      const loser = pair.participants.find(p => p.id !== winnerId);
      if (!loser) return prev;

      let updatedRounds = [...prev.rounds];
      const updatedPair = { ...pair, winner, status: 'completed' as const };
      const updatedPairs = [...currentRound.pairs];
      updatedPairs[pairIndex] = updatedPair;

      const roundIdx = updatedRounds.findIndex(r => r.bracket === prev.currentBracket && r.roundInBracket === prev.currentRoundInBracket);
      updatedRounds[roundIdx] = { ...currentRound, pairs: updatedPairs };

      updatedRounds = routeWinner(updatedRounds, prev.meta, prev.currentBracket, prev.currentRoundInBracket, pairIndex, winner);
      updatedRounds = routeLoser(updatedRounds, prev.meta, prev.currentBracket, prev.currentRoundInBracket, pairIndex, loser);

      const next: TournamentState = {
        ...prev,
        rounds: updatedRounds,
        roundStarted: true,
      };

      return settleAndCascade(next);
    });
  }, []);

  const getResults = useCallback((): TournamentResult[] => {
    if (!tournament || !tournament.isComplete) return [];

    const positions = new Map<string, number>();

    // Champion: 1
    if (tournament.champion) {
      positions.set(tournament.champion.id, 1);
    }

    // RunnerUp: 2
    if (tournament.runnerUp) {
      positions.set(tournament.runnerUp.id, 2);
    }

    // LB rounds: losers get positions 3, 4, 5, ...
    let position = 3;
    for (let j = tournament.meta.losersRounds - 1; j >= 0; j--) {
      const lbRound = findRound(tournament.rounds, 'losers', j);
      if (!lbRound) continue;

      const losersInRound: TournamentParticipant[] = [];
      lbRound.pairs.forEach(pair => {
        if (pair.status === 'completed' && pair.winner) {
          const winner = pair.winner;
          const loser = pair.participants.find(p => p.id !== winner.id);
          if (loser && !positions.has(loser.id)) {
            losersInRound.push(loser);
          }
        }
      });

      losersInRound.forEach(loser => {
        positions.set(loser.id, position++);
      });
    }

    // WB rounds: losers who didn't make it to LB (shouldn't happen in DE, but just in case)
    for (let r = tournament.meta.winnersRounds - 1; r >= 0; r--) {
      const wbRound = findRound(tournament.rounds, 'winners', r);
      if (!wbRound) continue;

      wbRound.pairs.forEach(pair => {
        if (pair.status === 'completed' && pair.winner) {
          const winner = pair.winner;
          const loser = pair.participants.find(p => p.id !== winner.id);
          if (loser && !positions.has(loser.id)) {
            positions.set(loser.id, position++);
          }
        }
      });
    }

    return tournament.allParticipants
      .map(p => ({
        ...p,
        position: positions.get(p.id) ?? tournament.allParticipants.length,
      }))
      .sort((a, b) => a.position - b.position || a.seed - b.seed);
  }, [tournament]);

  const resetRound = useCallback(() => {
    setTournament(prev => {
      if (!prev) return prev;

      // Only 2-slot pairs ever had a real choice to undo. A single-slot pair is
      // an automatic bye the user never decided — leave it exactly as-is; nulling
      // its winner without also being able to restore it (nothing to "replay")
      // would strand that participant with status:'bye' but no winner, and it
      // would never be routed forward again.
      const updatedRounds = prev.rounds.map(round => {
        if (round.bracket === prev.currentBracket && round.roundInBracket === prev.currentRoundInBracket) {
          return {
            ...round,
            pairs: round.pairs.map(pair =>
              pair.participants.length === 2
                ? { ...pair, winner: null, status: 'pending' as const }
                : pair
            ),
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
