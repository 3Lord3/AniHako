import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SearchSheet } from '@/components/Layout/SearchSheet';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useAnimeSearch: vi.fn(),
  };
});

import { useAnimeSearch } from '@/hooks';
import type { AnimeCatalogItem } from '@/types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

const mockAnime: AnimeCatalogItem = {
  anime_id: 1,
  anime_status: { title: 'Вышло', alias: 'released', value: 0 },
  anime_url: 'cowboy-bebop',
  poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
  rating: { average: 8.5, counters: 100 },
  title: 'Cowboy Bebop',
  type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
  year: 1998,
  description: '',
  views: 0,
  season: 1,
  episodes: { aired: 26, count: 26 },
};

describe('SearchSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnimeSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useAnimeSearch>);
  });

  it('does not show the sheet content when closed', () => {
    render(
      <SearchSheet open={false} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    expect(screen.queryByText('Поиск аниме')).not.toBeInTheDocument();
  });

  it('shows title and empty hint when open with no query', () => {
    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    expect(screen.getByText('Поиск аниме')).toBeInTheDocument();
    expect(screen.getByText(/начните вводить/i)).toBeInTheDocument();
  });

  it('shows "too short" hint for 1-2 characters', async () => {
    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i);
    fireEvent.change(input, { target: { value: 'ab' } });

    await waitFor(() => {
      expect(screen.getByText(/минимум 3 символа/i)).toBeInTheDocument();
    });
  });

  it('does not call useAnimeSearch until query is 3+ chars', async () => {
    vi.mocked(useAnimeSearch).mockReturnValue({
      data: { data: [], page: 1, total_pages: 1, total: 0 },
      isLoading: false,
    } as ReturnType<typeof useAnimeSearch>);

    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i);

    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => {
      expect(useAnimeSearch).toHaveBeenLastCalledWith('', 10);
    });

    fireEvent.change(input, { target: { value: 'cow' } });
    await waitFor(() => {
      expect(useAnimeSearch).toHaveBeenLastCalledWith('cow', 10);
    });
  });

  it('renders results with year and rating when query has matches', async () => {
    vi.mocked(useAnimeSearch).mockReturnValue({
      data: { data: [mockAnime], page: 1, total_pages: 1, total: 1 },
      isLoading: false,
    } as ReturnType<typeof useAnimeSearch>);

    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i);
    fireEvent.change(input, { target: { value: 'cow' } });

    await waitFor(() => {
      expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
      expect(screen.getByText('1998')).toBeInTheDocument();
      expect(screen.getByText('8.5')).toBeInTheDocument();
    });
  });

  it('shows "no results" message when query is 3+ chars and list is empty', async () => {
    vi.mocked(useAnimeSearch).mockReturnValue({
      data: { data: [], page: 1, total_pages: 1, total: 0 },
      isLoading: false,
    } as ReturnType<typeof useAnimeSearch>);

    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i);
    fireEvent.change(input, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText(/по запросу «xyz» ничего не найдено/i)).toBeInTheDocument();
    });
  });

  it('clear button empties the input', async () => {
    render(
      <SearchSheet open={true} onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'cow' } });

    await waitFor(() => {
      expect(input.value).toBe('cow');
    });

    const clearBtn = screen.getByRole('button', { name: /очистить/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('clicking a result calls onOpenChange(false)', async () => {
    vi.mocked(useAnimeSearch).mockReturnValue({
      data: { data: [mockAnime], page: 1, total_pages: 1, total: 1 },
      isLoading: false,
    } as ReturnType<typeof useAnimeSearch>);

    const onOpenChange = vi.fn();
    render(
      <SearchSheet open={true} onOpenChange={onOpenChange} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i);
    fireEvent.change(input, { target: { value: 'cow' } });

    await waitFor(() => {
      expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
    });

    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('clears query when sheet closes', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SearchSheet open={true} onOpenChange={onOpenChange} />,
      { wrapper: createWrapper() }
    );
    const input = screen.getByPlaceholderText(/введите название/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'cow' } });

    await waitFor(() => {
      expect(input.value).toBe('cow');
    });

    act(() => {
      rerender(<SearchSheet open={false} onOpenChange={onOpenChange} />);
    });

    // when re-opened, query should be reset
    rerender(<SearchSheet open={true} onOpenChange={onOpenChange} />);
    const inputAgain = screen.getByPlaceholderText(/введите название/i) as HTMLInputElement;
    expect(inputAgain.value).toBe('');
  });
});
