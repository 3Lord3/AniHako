import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useAnimeDetailPage } from '@/hooks/useAnimeDetailPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAddToList = vi.fn();
const mockUpdateListEntry = vi.fn();
const mockRemoveFromList = vi.fn();
const mockToggleFavorite = vi.fn();
const mockToggleVideoViewed = vi.fn();

let animeDetail: unknown;
let userAnimeList: unknown;
let videoViews: number[];
let currentUser: { id: number } | null;

vi.mock('@/hooks/useAnime', () => ({
  useAnimeDetail: () => ({ data: animeDetail, isLoading: false }),
  useAddToList: () => ({ mutate: mockAddToList }),
  useUserAnimeList: () => ({ data: userAnimeList }),
  useToggleFavorite: () => ({ mutate: mockToggleFavorite }),
  useUpdateListEntry: () => ({ mutate: mockUpdateListEntry }),
  useRemoveFromList: () => ({ mutate: mockRemoveFromList }),
  useVideoViews: () => ({ data: videoViews }),
  useToggleVideoViewed: () => ({ mutate: mockToggleVideoViewed }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useUser: () => ({ data: currentUser }),
}));

const baseAnime = {
  anime_id: 42,
  user: { list: { is_fav: false, list: undefined } },
};

describe('useAnimeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animeDetail = baseAnime;
    userAnimeList = [];
    videoViews = [];
    currentUser = { id: 1 };
  });

  it('redirects to /login instead of mutating when there is no user', () => {
    currentUser = null;
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleToggleFavorite();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it('adds to list when the anime has no existing user rate', () => {
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleAddToList('watching');
    });

    expect(mockAddToList).toHaveBeenCalledWith(
      { animeId: 42, status: 'watching', episodes: 0 },
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it('removes from list when re-selecting the current status', () => {
    animeDetail = { ...baseAnime, user: { list: { is_fav: false, list: { id: 0 } } } };
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleAddToList('watching');
    });

    expect(mockRemoveFromList).toHaveBeenCalledWith(42, expect.objectContaining({ onError: expect.any(Function) }));
    expect(mockAddToList).not.toHaveBeenCalled();
  });

  it('updates the existing list entry when the user already has a different rate', () => {
    userAnimeList = [{ anime_id: 42, user: { list: { is_fav: false, list: { id: 1 } } } }];
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleAddToList('completed');
    });

    expect(mockUpdateListEntry).toHaveBeenCalledWith(
      { animeId: 42, data: { status: 'completed' } },
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it('skips marking an episode complete if it is already viewed', () => {
    videoViews = [7];
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleEpisodeComplete(7);
    });

    expect(mockToggleVideoViewed).not.toHaveBeenCalled();
  });

  it('marks a new episode as watched via handleEpisodeComplete', () => {
    const { result } = renderHook(() => useAnimeDetailPage('some-url'), { wrapper: createWrapper() });

    act(() => {
      result.current.handleEpisodeComplete(9);
    });

    expect(mockToggleVideoViewed).toHaveBeenCalledWith(
      { videoId: 9, currentlyViewed: false },
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });
});
