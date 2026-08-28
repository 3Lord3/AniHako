import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useTournamentPage } from '@/hooks/useTournamentPage';
import type { YummyUserAnimeRate } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

let completedList: YummyUserAnimeRate[];
vi.mock('@/hooks/useAnime', () => ({
  useUserAnimeList: () => ({ data: completedList, isLoading: false }),
}));

const makeRate = (id: number, title: string): YummyUserAnimeRate =>
  ({
    anime_id: id,
    anime_url: `/anime/${id}`,
    anime_status: { title: 'Вышло', alias: 'released', value: 0 },
    title,
    poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
    rating: 8,
    type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
    year: 2024,
    date: 0,
  }) as unknown as YummyUserAnimeRate;

const fourRates = [makeRate(1, 'A'), makeRate(2, 'B'), makeRate(3, 'C'), makeRate(4, 'D')];

describe('useTournamentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    completedList = fourRates;
  });

  it('does not start a tournament with fewer than 4 participants', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleStart(fourRates.slice(0, 3));
    });

    expect(result.current.isStarted).toBe(false);
  });

  it('starts the tournament and fills the pair queue once the round starts', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleStart(fourRates);
    });
    expect(result.current.isStarted).toBe(true);

    act(() => {
      result.current.handleStartRound();
    });

    expect(result.current.activePair).not.toBeNull();
    expect(result.current.match).not.toBeNull();
    expect(result.current.totalInRound).toBe(2);
  });

  it('advances to the next queued pair after selecting a winner', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleStart(fourRates);
    });
    act(() => {
      result.current.handleStartRound();
    });
    const firstPairId = result.current.activePair!.id;
    const firstParticipantId = result.current.match!.participant1!.animeId;

    act(() => {
      result.current.handleSelectWinner(firstPairId, firstParticipantId);
    });

    expect(result.current.activePair).not.toBeNull();
    expect(result.current.activePair!.id).not.toBe(firstPairId);
  });

  it('resets tournament state on handleRestart', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleStart(fourRates);
    });
    act(() => {
      result.current.handleRestart();
    });

    expect(result.current.isStarted).toBe(false);
    expect(result.current.tournament).toBeNull();
  });

  it('navigates home via handleIntroBack', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleIntroBack();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('returns to the bracket view via handleBackToBracket, clearing the active pair', () => {
    const { result } = renderHook(() => useTournamentPage(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleStart(fourRates);
    });
    act(() => {
      result.current.handleStartRound();
    });
    expect(result.current.activePair).not.toBeNull();

    act(() => {
      result.current.handleBackToBracket();
    });

    expect(result.current.activePair).toBeNull();
  });
});
