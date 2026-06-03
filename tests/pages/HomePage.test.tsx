import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '@/pages/HomePage';
import * as useAnimeModule from '@/hooks/useAnime';

vi.mock('@/hooks/useAnime', () => ({
  useSchedule: vi.fn(),
  useAnimeList: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const mockAnimeItem = {
  anime_id: 1,
  title: 'Test Anime',
  anime_url: '/anime/1',
  poster: { small: '/poster.jpg', medium: '/poster.jpg', big: '', huge: '', fullsize: '', mega: '' },
  rating: { average: 8.5, counters: 100 },
  anime_status: { title: 'Вышло', alias: 'released', value: 0 },
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders season carousel section', async () => {
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: { data: [mockAnimeItem] },
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    render(<HomePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
  });

  it('shows skeleton loaders when seasonal anime is loading', async () => {
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    render(<HomePage />, { wrapper: createWrapper() });
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows skeleton loaders when schedule is loading', async () => {
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    render(<HomePage />, { wrapper: createWrapper() });
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders schedule section heading', async () => {
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    render(<HomePage />, { wrapper: createWrapper() });
    expect(screen.getByText('Расписание онгоингов')).toBeInTheDocument();
  });

  it('shows "Нет данных" when schedule is empty', async () => {
    vi.mocked(useAnimeModule.useAnimeList).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useAnimeList>);
    vi.mocked(useAnimeModule.useSchedule).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useAnimeModule.useSchedule>);

    render(<HomePage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Нет данных')).toBeInTheDocument();
    });
  });
});