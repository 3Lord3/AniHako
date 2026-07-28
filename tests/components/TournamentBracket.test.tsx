import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TournamentBracket } from '@/pages/AnimeTournamentPage/components/TournamentBracket';
import type { Round, TournamentParticipant } from '@/hooks/useTournament';
import type { AnimeCatalogItem } from '@/types';

const realParticipant = (id: string, title: string): TournamentParticipant => ({
  id,
  anime: { anime_id: 1, title } as AnimeCatalogItem,
  seed: 1,
  eliminated: false,
  finalPosition: null,
  losses: 0,
  isPlaceholder: false,
});

const placeholder = (id: string): TournamentParticipant => ({
  id,
  anime: { anime_id: -1, title: 'TBD', poster: null } as unknown as AnimeCatalogItem,
  seed: 0,
  eliminated: false,
  finalPosition: null,
  losses: 0,
  isPlaceholder: true,
});

describe('TournamentBracket', () => {
  it('does not reveal a future losers-bracket round just because it has a build-time placeholder bye', () => {
    // LB round0 has a real match in progress (current round); LB round1 is not
    // reached yet, but was built with a lone placeholder that got pre-marked
    // 'bye' at construction time — it must stay hidden, not show "BYE"/"TBD".
    const rounds: Round[] = [
      {
        index: 0,
        bracket: 'losers',
        roundInBracket: 0,
        isComplete: false,
        pairs: [
          {
            id: 'losers-r0-p0',
            bracket: 'losers',
            roundInBracket: 0,
            pairIndex: 0,
            participants: [realParticipant('p1', 'Real Anime One'), realParticipant('p2', 'Real Anime Two')],
            winner: null,
            status: 'playing',
          },
        ],
      },
      {
        index: 1,
        bracket: 'losers',
        roundInBracket: 1,
        isComplete: false,
        pairs: [
          {
            id: 'losers-r1-p0',
            bracket: 'losers',
            roundInBracket: 1,
            pairIndex: 0,
            participants: [placeholder('losers-r1-slot-0')],
            winner: placeholder('losers-r1-slot-0'),
            status: 'bye',
          },
        ],
      },
    ];

    render(
      <TournamentBracket
        rounds={rounds}
        currentBracket="losers"
        currentRoundInBracket={0}
        roundStarted={true}
        winnersRounds={3}
        losersRounds={2}
      />
    );

    expect(screen.queryByText('BYE')).not.toBeInTheDocument();
    expect(screen.queryByText('TBD')).not.toBeInTheDocument();
  });

  it('renders an unfilled slot as an empty cell instead of a "TBD" card', () => {
    const rounds: Round[] = [
      {
        index: 0,
        bracket: 'winners',
        roundInBracket: 0,
        isComplete: true,
        pairs: [
          {
            id: 'winners-r0-p0',
            bracket: 'winners',
            roundInBracket: 0,
            pairIndex: 0,
            participants: [realParticipant('p1', 'Real Anime One'), realParticipant('p2', 'Real Anime Two')],
            winner: realParticipant('p1', 'Real Anime One'),
            status: 'completed',
          },
        ],
      },
      {
        index: 1,
        bracket: 'winners',
        roundInBracket: 1,
        isComplete: false,
        pairs: [
          {
            id: 'winners-r1-p0',
            bracket: 'winners',
            roundInBracket: 1,
            pairIndex: 0,
            // One real winner has advanced in; the other slot is still an unresolved placeholder.
            participants: [realParticipant('p1', 'Real Anime One'), placeholder('winners-r1-slot-1')],
            winner: null,
            status: 'pending',
          },
        ],
      },
    ];

    render(
      <TournamentBracket
        rounds={rounds}
        currentBracket="winners"
        currentRoundInBracket={0}
        roundStarted={true}
        winnersRounds={2}
        losersRounds={0}
      />
    );

    expect(screen.getAllByText('Real Anime One').length).toBeGreaterThan(0);
    expect(screen.queryByText('TBD')).not.toBeInTheDocument();
  });
});
