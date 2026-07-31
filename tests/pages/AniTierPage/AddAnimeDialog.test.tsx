import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddAnimeDialog } from '@/pages/AniTierPage/components/AddAnimeDialog';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@/hooks', () => ({
  useAnimeList: vi.fn(),
}));

import { useAnimeList } from '@/hooks';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAnimeList).mockReturnValue({ data: { data: [] }, isLoading: false } as any);
  });

  it('prompts for a longer query before searching', () => {
    renderDialog();
    expect(screen.getByText(/Введите минимум/)).toBeInTheDocument();
  });

  it('shows search results and lets the user pick one', () => {
    vi.mocked(useAnimeList).mockReturnValue({
      data: { data: [{ anime_id: 9, title: 'Found Anime', anime_url: 'found', poster: posterField }] },
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

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

  it('excludes anime already present in the tier list', () => {
    vi.mocked(useAnimeList).mockReturnValue({
      data: { data: [{ anime_id: 9, title: 'Already Added', anime_url: 'added', poster: posterField }] },
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderDialog({ existingAnimeIds: new Set([9]) });
    fireEvent.change(screen.getByPlaceholderText('Название аниме...'), { target: { value: 'Already' } });

    expect(screen.queryByText('Already Added')).not.toBeInTheDocument();
  });

  it('shows a loading indicator while searching', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAnimeList).mockReturnValue({ data: undefined, isLoading: true } as any);

    renderDialog();
    fireEvent.change(screen.getByPlaceholderText('Название аниме...'), { target: { value: 'Query' } });

    expect(screen.getByText('Поиск...')).toBeInTheDocument();
  });
});
