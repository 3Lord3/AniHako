import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchHeader } from '@/pages/AnimeTournamentPage/components/MatchHeader';
import { TooltipProvider } from '@/components/ui/tooltip';

const renderHeader = (props: Partial<React.ComponentProps<typeof MatchHeader>> = {}) =>
  render(
    <TooltipProvider>
      <MatchHeader roundName="1 раунд" totalMatches={10} currentMatch={3} isFinal={false} {...props} />
    </TooltipProvider>
  );

describe('MatchHeader', () => {
  it('shows the current match position alongside the total, not just the total', () => {
    renderHeader({ currentMatch: 3, totalMatches: 10 });
    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.queryByText('(10)')).not.toBeInTheDocument();
  });
});
