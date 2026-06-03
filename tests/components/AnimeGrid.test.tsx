import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimeGrid } from '@/components/AnimeGrid';
import type { AnimeCatalogItem } from '@/types';

const mockAnimeList: AnimeCatalogItem[] = [
  { anime_id: 1, anime_status: { title: 'Вышло', alias: 'released', value: 0 }, anime_url: '/anime/1', poster: { small: '/posters/1-small.jpg', medium: '/posters/1.jpg', big: '/posters/1-big.jpg', huge: '/posters/1-huge.jpg', fullsize: '/posters/1-fullsize.jpg', mega: '/posters/1-mega.jpg' }, rating: { average: 8.0, counters: 100 }, title: 'Anime 1', type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' }, year: 2024, description: 'Test', views: 100, season: 1, episodes: { aired: 12, count: 12 } },
  { anime_id: 2, anime_status: { title: 'Вышло', alias: 'released', value: 0 }, anime_url: '/anime/2', poster: { small: '/posters/2-small.jpg', medium: '/posters/2.jpg', big: '/posters/2-big.jpg', huge: '/posters/2-huge.jpg', fullsize: '/posters/2-fullsize.jpg', mega: '/posters/2-mega.jpg' }, rating: { average: 7.5, counters: 80 }, title: 'Anime 2', type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' }, year: 2023, description: 'Test', views: 200, season: 2, episodes: { aired: 24, count: 24 } },
  { anime_id: 3, anime_status: { title: 'Вышло', alias: 'released', value: 0 }, anime_url: '/anime/3', poster: { small: '/posters/3-small.jpg', medium: '/posters/3.jpg', big: '/posters/3-big.jpg', huge: '/posters/3-huge.jpg', fullsize: '/posters/3-fullsize.jpg', mega: '/posters/3-mega.jpg' }, rating: { average: 9.0, counters: 200 }, title: 'Anime 3', type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' }, year: 2024, description: 'Test', views: 300, season: 1, episodes: { aired: 13, count: 13 } },
];

describe('AnimeGrid', () => {
  it('renders anime list', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={mockAnimeList} />
      </BrowserRouter>
    );

    expect(screen.getByText('Anime 1')).toBeInTheDocument();
    expect(screen.getByText('Anime 2')).toBeInTheDocument();
    expect(screen.getByText('Anime 3')).toBeInTheDocument();
  });

  it('renders correct number of cards', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={mockAnimeList} />
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
  });

  it('renders empty state when no anime', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Anime 1')).not.toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} isLoading={true} />
      </BrowserRouter>
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders loading skeleton with skeletonCount', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[]} isLoading={true} skeletonCount={6} />
      </BrowserRouter>
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it('renders single anime', () => {
    render(
      <BrowserRouter>
        <AnimeGrid anime={[mockAnimeList[0]]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Anime 1')).toBeInTheDocument();
    expect(screen.queryByText('Anime 2')).not.toBeInTheDocument();
  });

  it('renders anime without rating', () => {
    const noRatingAnime = [{ ...mockAnimeList[0], rating: { average: 0, counters: 0 } }];
    render(
      <BrowserRouter>
        <AnimeGrid anime={noRatingAnime} />
      </BrowserRouter>
    );

    expect(screen.getByText('Anime 1')).toBeInTheDocument();
  });

  it('renders anime with minimal poster', () => {
    const minimalPosterAnime = [{ ...mockAnimeList[0], poster: { small: '/posters/1-small.jpg', medium: '/posters/1.jpg', big: '', huge: '', fullsize: '', mega: '' } }];
    render(
      <BrowserRouter>
        <AnimeGrid anime={minimalPosterAnime} />
      </BrowserRouter>
    );

    expect(screen.getByText('Anime 1')).toBeInTheDocument();
  });
});