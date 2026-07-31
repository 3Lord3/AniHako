import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AniTierPage } from '@/pages/AniTierPage';
import { createEmptyTierList } from '@/types/tier';
import * as hooks from '@/hooks';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useUser: vi.fn(),
    useAnimeList: vi.fn(),
  };
});

vi.mock('@/hooks/useTierList', () => ({
  useTierList: vi.fn(),
}));

import { useTierList } from '@/hooks/useTierList';

function buildTierListMock(): ReturnType<typeof useTierList> {
  return {
    state: createEmptyTierList(),
    addTier: vi.fn(),
    renameTier: vi.fn(),
    recolorTier: vi.fn(),
    removeTier: vi.fn(),
    reorderTiers: vi.fn(),
    addAnime: vi.fn(),
    removeAnime: vi.fn(),
    moveAnime: vi.fn(),
    reset: vi.fn(),
  };
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AniTierPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AniTierPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useAnimeList).mockReturnValue({ data: { data: [] }, isLoading: false } as any);
  });

  it('shows a loading skeleton while the user is resolving', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useUser).mockReturnValue({ data: undefined, isLoading: true } as any);

    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows a login prompt when there is no authenticated user', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useUser).mockReturnValue({ data: null, isLoading: false } as any);

    renderPage();
    expect(screen.getByText('Для составления тир-листа необходимо войти')).toBeInTheDocument();
  });

  it('renders the tier board once the user is loaded', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useUser).mockReturnValue({ data: { id: 1 }, isLoading: false } as any);
    vi.mocked(useTierList).mockReturnValue(buildTierListMock());

    renderPage();

    expect(screen.getByRole('heading', { name: /AniTier/ })).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('Не оценено')).toBeInTheDocument();
  });

  it('opens the manage-tiers dialog and adds a tier from it', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useUser).mockReturnValue({ data: { id: 1 }, isLoading: false } as any);
    const tierListMock = buildTierListMock();
    vi.mocked(useTierList).mockReturnValue(tierListMock);

    renderPage();
    fireEvent.click(screen.getByText('Тиры'));

    expect(screen.getByText('Управление тирами')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Добавить тир'));

    expect(tierListMock.addTier).toHaveBeenCalledTimes(1);
  });

  it('opens the reset confirmation dialog', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(hooks.useUser).mockReturnValue({ data: { id: 1 }, isLoading: false } as any);
    vi.mocked(useTierList).mockReturnValue(buildTierListMock());

    renderPage();
    fireEvent.click(screen.getByText('Сбросить'));

    expect(screen.getByText('Сбросить тир-лист?')).toBeInTheDocument();
  });
});
