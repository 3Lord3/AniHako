import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimeCard } from '@/components/AnimeCard';
import type { AnimeCatalogItem } from '@/types';

const mockAnime: AnimeCatalogItem = {
  anime_id: 1,
  anime_status: { title: 'Вышло', alias: 'released', value: 0 },
  anime_url: '1',
  poster: { small: '/posters/1-small.jpg', medium: '/posters/1.jpg', big: '/posters/1-big.jpg', huge: '/posters/1-huge.jpg', fullsize: '/posters/1-fullsize.jpg', mega: '/posters/1-mega.jpg' },
  rating: { average: 8.5, counters: 100 },
  title: 'Test Anime Title',
  type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
  year: 2024,
  description: 'Test description',
  views: 1000,
  season: 1,
  episodes: { aired: 12, count: 12 },
};

const renderComponent = (props: Partial<React.ComponentProps<typeof AnimeCard>> = {}) => {
  return render(
    <BrowserRouter>
      <AnimeCard anime={mockAnime} {...props} />
    </BrowserRouter>
  );
};

describe('AnimeCard', () => {
  it('renders anime title', () => {
    renderComponent();
    expect(screen.getByText('Test Anime Title')).toBeInTheDocument();
  });

  it('renders anime poster image', () => {
    renderComponent();
    const img = screen.getByAltText('Test Anime Title') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/posters/1-mega.jpg');
  });

  it('renders rating badge when showRating is true', () => {
    renderComponent({ showRating: true });
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('does not render rating when showRating is false', () => {
    renderComponent({ showRating: false });
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  it('does not render rating when rating is undefined', () => {
    renderComponent({ anime: { ...mockAnime, rating: { average: 0, counters: 0 } } });
    expect(screen.queryByText('0.00')).not.toBeInTheDocument();
  });

  it('renders user status badge when provided', () => {
    renderComponent({ userStatus: 'watching' });
    expect(screen.getByTitle('Смотрю')).toBeInTheDocument();
  });

  it('renders completed status badge', () => {
    renderComponent({ userStatus: 'completed' });
    expect(screen.getByTitle('Просмотрено')).toBeInTheDocument();
  });

  it('renders favorite badge when isFavorite is true', () => {
    renderComponent({ isFavorite: true });
    expect(screen.getByTitle('Избранное')).toBeInTheDocument();
  });

  it('does not render favorite badge when isFavorite is false', () => {
    renderComponent({ isFavorite: false });
    expect(screen.queryByTitle('Избранное')).not.toBeInTheDocument();
  });

  it('renders link to anime detail page', () => {
    renderComponent();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/anime/1');
  });

  it('handles anime without poster', () => {
    renderComponent({ anime: { ...mockAnime, poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' } } });
    const img = screen.getByAltText('Test Anime Title') as HTMLImageElement;
    expect(img.src).not.toContain('null');
  });

it('handles anime without year', () => {
    const noYearAnime = { ...mockAnime, year: 0 };
    renderComponent({ anime: noYearAnime });
    expect(screen.getByText('Test Anime Title')).toBeInTheDocument();
  });
});