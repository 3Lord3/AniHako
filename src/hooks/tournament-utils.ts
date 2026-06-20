import type { TournamentParticipant, Pair, Round } from './tournament-types';
import type { AnimeCatalogItem } from '@/types';

/**
 * Участник турнира (для локального использования в утилитах)
 */
export interface LocalAnimeItem {
  id: number;
  name: string;
  russian: string | null;
  poster: string | null;
  score: string | null;
  [key: string]: any;
}

/**
 * Перемешать массив (Fisher-Yates shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Сгенерировать ID пары
 */
export function generatePairId(roundIndex: number, pairIndex: number): string {
  return `round-${roundIndex}-pair-${pairIndex}`;
}

/**
 * Создать пары для раунда из списка участников.
 * Если нечётное количество участников, последний получает bye.
 */
export function createPairsForRound(
  participants: TournamentParticipant[],
  roundIndex: number
): Pair[] {
  const pairs: Pair[] = [];

  for (let i = 0; i < participants.length; i += 2) {
    const pairIndex = pairs.length;
    const pair: Pair = {
      id: generatePairId(roundIndex, pairIndex),
      roundIndex,
      pairIndex,
      participants: [participants[i]],
      winner: null,
      status: 'pending',
    };

    if (i + 1 < participants.length) {
      pair.participants.push(participants[i + 1]);
    } else {
      // Нечётное количество - участник получает bye
      pair.status = 'bye';
      pair.winner = participants[i];
    }

    pairs.push(pair);
  }

  return pairs;
}

/**
 * Построить структуру раундов турнира.
 * Каждый раунд имеет пары, победитель каждой пары переходит в следующий раунд.
 */
export function buildTournamentRounds(animeList: AnimeCatalogItem[]): Round[] {
  const shuffled = shuffleArray(animeList);

  const participants: TournamentParticipant[] = shuffled.map((anime, index) => ({
    id: `participant-${anime.anime_id}`,
    anime,
    seed: index + 1,
    eliminated: false,
    finalPosition: null,
  }));

  const rounds: Round[] = [];
  let currentParticipants = [...participants];
  let roundIndex = 0;

  while (currentParticipants.length > 1) {
    const pairs = createPairsForRound(currentParticipants, roundIndex);

    rounds.push({
      index: roundIndex,
      pairs,
      isComplete: false,
    });

    // Для следующего раунда создаём placeholder участников
    const nextRoundSize = Math.ceil(currentParticipants.length / 2);
    const nextParticipants: TournamentParticipant[] = [];
    for (let i = 0; i < nextRoundSize; i++) {
      nextParticipants.push({
        id: `placeholder-${roundIndex + 1}-${i}`,
        anime: { id: -1, name: 'TBD', russian: null, poster: null, score: null } as unknown as AnimeCatalogItem,
        seed: i + 1,
        eliminated: false,
        finalPosition: null,
      });
    }

    currentParticipants = nextParticipants;
    roundIndex++;
  }

  return rounds;
}

/**
 * Получить название раунда по его индексу
 */
export function getRoundName(roundIndex: number, totalRounds: number): string {
  const displayRound = roundIndex + 1;
  if (displayRound === totalRounds) return 'Финал';
  if (totalRounds === 2 && displayRound === 1) return 'Полуфинал';
  if (totalRounds === 3 && displayRound === 1) return 'Четвертьфинал';
  if (totalRounds === 3 && displayRound === 2) return 'Полуфинал';
  if (displayRound === totalRounds - 1) return 'Полуфинал';
  if (displayRound === totalRounds - 2) return 'Четвертьфинал';
  return `${displayRound} раунд`;
}