import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TournamentResults } from '@/pages/AnimeTournamentPage/components/TournamentResults';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { TournamentParticipant } from '@/hooks/useTournament';
import type { AnimeCatalogItem } from '@/types';

const mkParticipant = (
  id: string,
  position: number,
  opts: { userRating?: number; communityRating?: number } = {}
): TournamentParticipant & { position: number } => ({
  id,
  position,
  seed: position,
  eliminated: position !== 1,
  finalPosition: position,
  losses: 0,
  isPlaceholder: false,
  anime: {
    anime_id: Number(id.replace(/\D/g, '')) || 1,
    anime_status: { title: 'Вышло', alias: 'released', value: 0 },
    anime_url: '/1',
    poster: { small: '', medium: '', big: '', huge: '', fullsize: '', mega: '' },
    rating: opts.communityRating ? { average: opts.communityRating, counters: 100 } : undefined,
    user: opts.userRating ? { rating: opts.userRating } : undefined,
    title: `Anime ${id}`,
    type: { name: 'TV', value: 1, shortname: 'tv', alias: 'tv' },
    year: 2024,
    description: '',
    views: 0,
    season: 1,
    episodes: { aired: 12, count: 12 },
  } as AnimeCatalogItem,
});

const renderResults = (participants: Array<TournamentParticipant & { position: number }>) =>
  render(
    <BrowserRouter>
      <TooltipProvider>
        <TournamentResults participants={participants} champion={null} onRestart={() => {}} />
      </TooltipProvider>
    </BrowserRouter>
  );

describe('TournamentResults', () => {
  it('shows both the user\'s own rating and the community rating as separate badges', () => {
    const participants = [mkParticipant('p1', 1, { userRating: 9, communityRating: 7.5 })];
    renderResults(participants);

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('★ 7.5')).toBeInTheDocument();
  });

  it('omits the user rating badge when the user never rated the anime', () => {
    const participants = [mkParticipant('p1', 1, { communityRating: 8.2 })];
    renderResults(participants);

    expect(screen.getByText('★ 8.2')).toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('renders without crashing when neither rating is present', () => {
    const participants = [mkParticipant('p1', 1)];
    expect(() => renderResults(participants)).not.toThrow();
  });
});
