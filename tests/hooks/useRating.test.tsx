import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useRateAnime, useUnrateAnime } from '@/hooks/useAnime';
import * as animeApiModule from '@/api/anime';

vi.mock('@/api/anime', () => ({
  animeApi: {
    rate: vi.fn(),
    unrate: vi.fn(),
  },
}));

describe('anime rating mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useRateAnime sends PUT /anime/{id}/rate with the integer rate', async () => {
    vi.mocked(animeApiModule.animeApi.rate).mockResolvedValueOnce({ rating: 8.5, votes: 100 });

    const { result } = renderHook(() => useRateAnime(), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MemoryRouter>
      ),
    });

    await act(async () => {
      result.current.mutate({ animeId: 7, rate: 8 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(animeApiModule.animeApi.rate).toHaveBeenCalledWith(7, 8);
    expect(result.current.data).toEqual({ rating: 8.5, votes: 100 });
  });

  it('useUnrateAnime sends DELETE /anime/{id}/rate', async () => {
    vi.mocked(animeApiModule.animeApi.unrate).mockResolvedValueOnce({ rating: 8.0, votes: 99 });

    const { result } = renderHook(() => useUnrateAnime(), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MemoryRouter>
      ),
    });

    await act(async () => {
      result.current.mutate(7);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(animeApiModule.animeApi.unrate).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual({ rating: 8.0, votes: 99 });
  });

  it('invalidates rating-related queries after rate success', async () => {
    vi.mocked(animeApiModule.animeApi.rate).mockResolvedValueOnce({ rating: 8.5, votes: 100 });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRateAnime(), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MemoryRouter>
      ),
    });

    await act(async () => {
      result.current.mutate({ animeId: 7, rate: 8 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = invalidateSpy.mock.calls.map(([arg]) =>
      (arg as { queryKey: unknown[] })?.queryKey
    );
    expect(keys.some((k) => k && k[0] === 'anime' && k[1] === 'catalog')).toBe(true);
    expect(keys.some((k) => k && k[0] === 'anime' && k[1] === 'detail')).toBe(true);
    expect(keys.some((k) => k && k[0] === 'user' && k[1] === 'anime')).toBe(true);
  });
});