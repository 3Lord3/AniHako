import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

describe('Tooltip', () => {
  it('renders tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('renders tooltip content when open', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });
});