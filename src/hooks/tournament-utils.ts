import type { TournamentParticipant, Pair, Round, BracketType } from './tournament-types';
import type { AnimeCatalogItem } from '@/types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generatePairId(bracket: BracketType, roundInBracket: number, pairIndex: number): string {
  return `${bracket}-r${roundInBracket}-p${pairIndex}`;
}

export function winnersRoundsFor(participantsCount: number): number {
  if (participantsCount < 2) return 0;
  return Math.ceil(Math.log2(participantsCount));
}

export function losersRoundsFor(winnersRounds: number): number {
  if (winnersRounds < 2) return 0;
  return 2 * (winnersRounds - 1);
}

/**
 * Куда попадает проигравший в WB-раунде roundInBracket.
 * WB R0 → LB R0, WB R1 → LB R1, WB R2 → LB R3, WB Rk → LB R(2k-1) for k>0.
 */
export function lbRoundForWbLoss(roundInBracket: number): number {
  return roundInBracket === 0 ? 0 : 2 * roundInBracket - 1;
}

/**
 * Размер WB-раунда на входе: WB раунды строятся через ceil(size/2), поэтому
 * при N не степени двойки в отдельных раундах может быть "нечётный" BYE.
 * Единственный источник этой прогрессии — buildTournamentRounds строит по
 * ней те же раунды, а computeLbPairCounts выводит из неё размеры LB.
 */
function wbRoundSizes(N: number, wbRounds: number): number[] {
  const sizes: number[] = [];
  let size = N;
  for (let r = 0; r < wbRounds; r++) {
    sizes.push(size);
    size = Math.max(1, Math.ceil(size / 2));
  }
  return sizes;
}

/** Реальное число проигравших в каждом WB раунде (BYE не производит проигравшего). */
function wbLoserCounts(N: number, wbRounds: number): number[] {
  return wbRoundSizes(N, wbRounds).map(size => Math.floor(size / 2));
}

/**
 * Вычислить количество пар в каждом LB раунде.
 * Раунд 0 и чётные раунды — "малые" (minor), переигровка победителей LB между собой.
 * Нечётные раунды — "большие" (major), победители предыдущего minor-раунда встречают
 * новых проигравших из WB, каждый — со своим персональным соперником (interleave),
 * а не друг с другом внутри своей группы. Размеры выводятся из фактического числа
 * проигравших в каждом WB раунде (а не из идеализированной формулы ceil(N/4)), иначе
 * при N не степени двойки часть участников не помещается в целевую пару и молча
 * теряется при продвижении. Major-раунд обязан вмещать max(survivors, newLosers)
 * пар — не ceil((survivors+newLosers)/2) — иначе индексной адресации 1:1
 * (advanceParticipant в useTournament.ts) не хватит слотов и часть survivors/
 * newLosers будет записана поверх друг друга либо адресована мимо массива пар.
 */
export function computeLbPairCounts(N: number, wbRounds: number): number[] {
  const lbRounds = losersRoundsFor(wbRounds);
  if (lbRounds === 0) return [];

  const wbLosers = wbLoserCounts(N, wbRounds);

  const counts: number[] = [];
  let prevWinners = 0;
  for (let j = 0; j < lbRounds; j++) {
    let pairCount: number;
    if (j === 0) {
      pairCount = Math.max(1, Math.ceil(wbLosers[0] / 2));
    } else if (j % 2 === 1) {
      const wbRoundIdx = (j + 1) / 2;
      const newLosers = wbLosers[wbRoundIdx] ?? 0;
      pairCount = Math.max(1, prevWinners, newLosers);
    } else {
      pairCount = Math.max(1, Math.ceil(prevWinners / 2));
    }
    counts.push(pairCount);
    prevWinners = pairCount;
  }
  return counts;
}

function makePair(
  bracket: BracketType,
  roundInBracket: number,
  pairIndex: number,
  a: TournamentParticipant,
  b: TournamentParticipant | null
): Pair {
  if (b) {
    return {
      id: generatePairId(bracket, roundInBracket, pairIndex),
      bracket,
      roundInBracket,
      pairIndex,
      participants: [a, b],
      winner: null,
      status: 'pending',
    };
  }
  return {
    id: generatePairId(bracket, roundInBracket, pairIndex),
    bracket,
    roundInBracket,
    pairIndex,
    participants: [a],
    // A placeholder isn't a real winner yet — leave it unresolved until a real
    // participant lands in this slot (advanceParticipant sets winner then).
    winner: a.isPlaceholder ? null : a,
    status: 'bye',
  };
}

function pairUp(
  bracket: BracketType,
  roundInBracket: number,
  participants: TournamentParticipant[]
): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < participants.length; i += 2) {
    const a = participants[i];
    const b = i + 1 < participants.length ? participants[i + 1] : null;
    pairs.push(makePair(bracket, roundInBracket, pairs.length, a, b));
  }
  return pairs;
}

function placeholder(bracket: BracketType, roundInBracket: number, index: number, label: string): TournamentParticipant {
  return {
    id: `${bracket}-r${roundInBracket}-slot-${index}`,
    anime: { anime_id: -1, title: label, poster: null } as unknown as AnimeCatalogItem,
    seed: 0,
    eliminated: false,
    finalPosition: null,
    losses: 0,
    isPlaceholder: true,
  };
}

export interface BuiltRounds {
  rounds: Round[];
  winnersRounds: number;
  losersRounds: number;
}

export function buildTournamentRounds(animeList: AnimeCatalogItem[]): BuiltRounds {
  const shuffled = shuffleArray(animeList);
  const winnersRounds = winnersRoundsFor(shuffled.length);
  const losersRounds = losersRoundsFor(winnersRounds);

  const participants: TournamentParticipant[] = shuffled.map((anime, index) => ({
    id: `participant-${anime.anime_id}`,
    anime,
    seed: index + 1,
    eliminated: false,
    finalPosition: null,
    losses: 0,
    isPlaceholder: false,
  }));

  const rounds: Round[] = [];
  let globalIndex = 0;

  // Winners bracket: round 0 holds real participants, later rounds have placeholders.
  const wbSizes = wbRoundSizes(participants.length, winnersRounds);
  let wbParticipants: TournamentParticipant[] = participants;
  for (let r = 0; r < winnersRounds; r++) {
    const pairs = pairUp('winners', r, wbParticipants);
    rounds.push({ index: globalIndex++, bracket: 'winners', roundInBracket: r, pairs, isComplete: false });

    const nextSize = wbSizes[r + 1] ?? 1;
    wbParticipants = Array.from({ length: nextSize }, (_, i) =>
      placeholder('winners', r + 1, i, 'TBD')
    );
  }

  // Losers bracket: every round starts with placeholders, to be filled as WB/LB produce results.
  const lbPairCounts = computeLbPairCounts(participants.length, winnersRounds);
  for (let r = 0; r < losersRounds; r++) {
    const pairCount = lbPairCounts[r] ?? 1;
    const slots = Array.from({ length: pairCount * 2 }, (_, i) => placeholder('losers', r, i, 'TBD'));
    const pairs = pairUp('losers', r, slots);
    rounds.push({ index: globalIndex++, bracket: 'losers', roundInBracket: r, pairs, isComplete: false });
  }

  // Grand final: WB winner vs LB winner (only if LB exists).
  if (losersRounds > 0) {
    const finalPairs: Pair[] = [
      {
        id: generatePairId('final', 0, 0),
        bracket: 'final',
        roundInBracket: 0,
        pairIndex: 0,
        participants: [placeholder('final', 0, 0, 'Победитель сетки победителей'), placeholder('final', 0, 1, 'Победитель сетки проигравших')],
        winner: null,
        status: 'pending',
      },
    ];
    rounds.push({ index: globalIndex++, bracket: 'final', roundInBracket: 0, pairs: finalPairs, isComplete: false });
  }

  return { rounds, winnersRounds, losersRounds };
}

export function getRoundName(
  bracket: BracketType,
  roundInBracket: number,
  totalWbRounds: number,
  totalLbRounds: number
): string {
  if (bracket === 'final') return 'Гранд-финал';

  if (bracket === 'winners') {
    const display = roundInBracket + 1;
    const fromTop = totalWbRounds - display;
    if (fromTop === 0) return 'Финал';
    if (fromTop === 1) return 'Полуфинал';
    if (fromTop === 2) return 'Четвертьфинал';
    if (fromTop === 3) return '1/8 финала';
    return `${display} раунд`;
  }

  const display = roundInBracket + 1;
  if (roundInBracket === totalLbRounds - 1) return 'Финал';
  return `${display} раунд`;
}
