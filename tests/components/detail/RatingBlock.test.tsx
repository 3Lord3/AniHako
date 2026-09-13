import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RatingBlock } from '@/components/detail/RatingBlock';
import * as animeApiModule from '@/api/anime';

vi.mock('@/api/anime', () => ({
  animeApi: {
    rate: vi.fn(),
    unrate: vi.fn(),
  },
}));

function renderRating(props: Partial<React.ComponentProps<typeof RatingBlock>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <RatingBlock animeId={1} overallRating={8.5} votes={120} enabled {...props} />
    </QueryClientProvider>
  );
}

describe('RatingBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a trigger button that opens the rating dialog', async () => {
    renderRating();
    const user = userEvent.setup();

    const trigger = screen.getByRole('button', { name: 'Оценить' });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByText('8.50')).toBeInTheDocument();
    expect(screen.getByText('120 голосов')).toBeInTheDocument();
  });

  it('shows "Моя оценка" on the trigger when the user already rated', () => {
    renderRating({ currentUserRating: 7 });
    expect(screen.getByRole('button', { name: 'Моя оценка: 7' })).toBeInTheDocument();
  });

  it('computes the final rating as the arithmetic mean of four criteria and rates via API', async () => {
    vi.mocked(animeApiModule.animeApi.rate).mockResolvedValueOnce({ rating: 8.0, votes: 121 });
    renderRating();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Оценить' }));

    // 4 критерия: Сюжет=8, Мир=9, Персонажи=7, Общее впечатление=6
    // итог = round((8+9+7+6)/4)=round(7.5)=8
    await user.click(screen.getByLabelText('Сюжет: 8'));
    await user.click(screen.getByLabelText('Мир: 9'));
    await user.click(screen.getByLabelText('Персонажи: 7'));
    await user.click(screen.getByLabelText('Общее впечатление: 6'));

    expect(screen.getByText('8')).toBeInTheDocument(); // badge "Итоговая оценка"

    await user.click(screen.getByRole('button', { name: 'Оценить' }));

    await waitFor(() => expect(animeApiModule.animeApi.rate).toHaveBeenCalledWith(1, 8));
  });

  it('re-voting a criterion changes the value instead of clearing it', async () => {
    vi.mocked(animeApiModule.animeApi.rate).mockResolvedValueOnce({ rating: 0, votes: 0 });
    renderRating();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Оценить' }));

    // Сюжет=8, затем переголосуем на 5 (внутри закрашенного диапазона)
    await user.click(screen.getByLabelText('Сюжет: 8'));
    await user.click(screen.getByLabelText('Сюжет: 5'));

    // Остальные: Мир=4, Персонажи=4, Общее=4 → итог = round((5+4+4+4)/4)=4
    await user.click(screen.getByLabelText('Мир: 4'));
    await user.click(screen.getByLabelText('Персонажи: 4'));
    await user.click(screen.getByLabelText('Общее впечатление: 4'));

    expect(screen.getByText('4')).toBeInTheDocument(); // итог, а не «—»
  });

  it('shows "Убрать" when the user has a rating and unrates via API', async () => {
    vi.mocked(animeApiModule.animeApi.unrate).mockResolvedValueOnce({ rating: 8.2, votes: 119 });

    renderRating({ currentUserRating: 6 });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Моя оценка: 6' }));
    expect(screen.getByRole('button', { name: 'Убрать' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Убрать' }));

    await waitFor(() => expect(animeApiModule.animeApi.unrate).toHaveBeenCalledWith(1));
  });
});