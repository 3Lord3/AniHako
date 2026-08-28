import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddAnimeDialog } from '@/pages/AniTierPage/components/AddAnimeDialog';

vi.mock('@/hooks', () => ({
  useAnimeSearchQuery: vi.fn(),
}));

import { useAnimeSearchQuery } from '@/hooks';

const posterField = { small: 'poster.jpg', medium: '', big: '', huge: '', fullsize: '', mega: '' };

function renderDialog(overrides: Partial<React.ComponentProps<typeof AddAnimeDialog>> = {}) {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <AddAnimeDialog
      open
      onOpenChange={onOpenChange}
      existingAnimeIds={new Set()}
      onSelect={onSelect}
      {...overrides}
    />
  );
  return { onSelect, onOpenChange };
}

describe('AddAnimeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnimeSearchQuery).mockReturnValue({
      results: [],
      isLoading: false,
      isQueryLongEnough: false,
      debouncedQuery: '',
    } as unknown as ReturnType<typeof useAnimeSearchQuery>);
  });

  it('prompts for a longer query before searching', () => {
    renderDialog();
    expect(screen.getByText(/Введите минимум/)).toBeInTheDocument();
  });

  it('shows search results and lets the user pick one', () => {
    vi.mocked(useAnimeSearchQuery).mockReturnValue({
      results: [{ anime_id: 9, title: 'Found Anime', anime_url: 'found', poster: posterField }],
      isLoading: false,
      isQueryLongEnough: true,
      debouncedQuery: 'Found',
    } as unknown as ReturnType<typeof useAnimeSearchQuery>);

    const { onSelect, onOpenChange } = renderDialog();

    fireEvent.change(screen.getByPlaceholderText('Название аниме...'), { target: { value: 'Found' } });
    fireEvent.click(screen.getByText('Found Anime'));

    expect(onSelect).toHaveBeenCalledWith({
      animeId: 9,
      title: 'Found Anime',
      posterUrl: 'poster.jpg',
      url: 'found',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('passes an exclude predicate that filters out already-added anime', () => {
    renderDialog({ existingAnimeIds: new Set([9]) });

    const options = vi.mocked(useAnimeSearchQuery).mock.calls[0][1];
    expect(options?.exclude?.({ anime_id: 9 } as never)).toBe(true);
    expect(options?.exclude?.({ anime_id: 1 } as never)).toBe(false);
  });

  it('shows a loading indicator while searching', () => {
    vi.mocked(useAnimeSearchQuery).mockReturnValue({
      results: [],
      isLoading: true,
      isQueryLongEnough: true,
      debouncedQuery: 'Query',
    } as unknown as ReturnType<typeof useAnimeSearchQuery>);

    renderDialog();
    fireEvent.change(screen.getByPlaceholderText('Название аниме...'), { target: { value: 'Query' } });

    expect(screen.getByText('Поиск...')).toBeInTheDocument();
  });
});
