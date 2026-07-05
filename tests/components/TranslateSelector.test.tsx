import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TranslateSelector } from '@/pages/AnimeDetailPage/components/TranslateSelector';
import type { AnimeTranslate } from '@/types';

const translates: AnimeTranslate[] = [
  { title: 'AniDub', href: 'anidub', value: 1 },
  { title: 'Субтитры', href: 'subs', value: 2 },
];

describe('TranslateSelector', () => {
  it('renders nothing when there is only one translate', () => {
    const { container } = render(
      <TranslateSelector
        translates={[{ title: 'Solo', href: 's', value: 1 }]}
        value={1}
        onChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when translates is empty', () => {
    const { container } = render(
      <TranslateSelector translates={[]} value={null} onChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a trigger button with the selected label', () => {
    render(<TranslateSelector translates={translates} value={2} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: /Субтитры/ });
    expect(trigger).toBeInTheDocument();
  });

  it('opens the listbox with all options on trigger click', async () => {
    const user = userEvent.setup();
    render(<TranslateSelector translates={translates} value={1} onChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /AniDub/ }));

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'AniDub' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Субтитры' })).toBeInTheDocument();
  });

  it('calls onChange with the numeric value when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TranslateSelector translates={translates} value={1} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /AniDub/ }));
    await user.click(screen.getByRole('option', { name: 'Субтитры' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('marks the active option as aria-selected', async () => {
    const user = userEvent.setup();
    render(<TranslateSelector translates={translates} value={2} onChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Субтитры/ }));
    expect(screen.getByRole('option', { name: 'AniDub' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('option', { name: 'Субтитры' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('closes the listbox on Escape', async () => {
    const user = userEvent.setup();
    render(<TranslateSelector translates={translates} value={1} onChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /AniDub/ }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
