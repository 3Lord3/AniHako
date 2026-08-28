import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SearchSheet } from '@/components/Layout/SearchSheet';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/hooks')>('@/hooks');
  return {
    ...actual,
    useSearchSheet: vi.fn(),
  };
});

import { useSearchSheet } from '@/hooks';
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

const baseReturn = {
  query: '',
  setQuery: vi.fn(),
  clearQuery: vi.fn(),
  inputRef: { current: null },
  keyboardInset: 0,
  list: [] as AnimeCatalogItem[],
  isLoading: false,
  trimmedQuery: '',
  isTooShort: false,
  showEmpty: true,
  showNoResults: false,
};

describe('SearchSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchSheet).mockReturnValue(baseReturn as unknown as ReturnType<typeof useSearchSheet>);
  });

  it('does not show the sheet content when closed', () => {
    render(<SearchSheet open={false} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.queryByText('Поиск аниме')).not.toBeInTheDocument();
  });

  it('shows title and empty hint when open with no query', () => {
    render(<SearchSheet open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText('Поиск аниме')).toBeInTheDocument();
    expect(screen.getByText(/начните вводить/i)).toBeInTheDocument();
  });

  it('shows "too short" hint when isTooShort is true', () => {
    vi.mocked(useSearchSheet).mockReturnValue({
      ...baseReturn,
      isTooShort: true,
      showEmpty: false,
    } as unknown as ReturnType<typeof useSearchSheet>);

    render(<SearchSheet open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText(/минимум 3 символа/i)).toBeInTheDocument();
  });

  it('renders results with year and rating', () => {
    vi.mocked(useSearchSheet).mockReturnValue({
      ...baseReturn,
      list: [mockAnime],
      showEmpty: false,
    } as unknown as ReturnType<typeof useSearchSheet>);

    render(<SearchSheet open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText('Cowboy Bebop')).toBeInTheDocument();
    expect(screen.getByText('1998')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('shows "no results" message when showNoResults is true', () => {
    vi.mocked(useSearchSheet).mockReturnValue({
      ...baseReturn,
      trimmedQuery: 'xyz',
      showEmpty: false,
      showNoResults: true,
    } as unknown as ReturnType<typeof useSearchSheet>);

    render(<SearchSheet open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText(/по запросу «xyz» ничего не найдено/i)).toBeInTheDocument();
  });

  it('clear button calls clearQuery', () => {
    const clearQuery = vi.fn();
    vi.mocked(useSearchSheet).mockReturnValue({
      ...baseReturn,
      query: 'cow',
      clearQuery,
      showEmpty: false,
    } as unknown as ReturnType<typeof useSearchSheet>);

    render(<SearchSheet open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: /очистить/i }));
    expect(clearQuery).toHaveBeenCalled();
  });

  it('clicking a result calls onOpenChange(false)', () => {
    vi.mocked(useSearchSheet).mockReturnValue({
      ...baseReturn,
      list: [mockAnime],
      showEmpty: false,
    } as unknown as ReturnType<typeof useSearchSheet>);

    const onOpenChange = vi.fn();
    render(<SearchSheet open={true} onOpenChange={onOpenChange} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('link'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
