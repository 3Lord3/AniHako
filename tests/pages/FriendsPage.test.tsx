import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FriendsPage } from '@/pages/FriendsPage';
import * as hooks from '@/hooks';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useUser: vi.fn(),
    useFriendActions: vi.fn(),
    useFriends: vi.fn(),
    useFriendsByCategory: vi.fn(),
  };
});

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FriendsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('FriendsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useFriendActions).mockReturnValue({
      addFriend: vi.fn(),
      removeFriend: vi.fn(),
      pendingFriendIds: new Set(),
      error: null,
      resetError: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useFriendActions>);
    vi.mocked(hooks.useFriendsByCategory).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriendsByCategory>);
  });

  it('shows a login prompt when there is no authenticated user', () => {
    vi.mocked(hooks.useUser).mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({ data: undefined, isLoading: false } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();
    expect(screen.getByText('Для просмотра друзей необходимо войти')).toBeInTheDocument();
  });

  it('renders the page title, tabs and the "all" list once the user loads', async () => {
    vi.mocked(hooks.useUser).mockReturnValue({
      data: { id: 42, nickname: 'Me' },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: [{ id: 1, nickname: 'Alice', friend_status: 'friends' }],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();

    expect(screen.getByRole('heading', { name: 'Друзья' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText('Подписчики')).toBeInTheDocument();
    expect(screen.getByText('Входящие заявки')).toBeInTheDocument();
  });

  it('marks friends as pending using the ids reported by useFriendActions', async () => {
    vi.mocked(hooks.useFriendActions).mockReturnValue({
      addFriend: vi.fn(),
      removeFriend: vi.fn(),
      pendingFriendIds: new Set([1, 2]),
      error: null,
      resetError: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useFriendActions>);
    vi.mocked(hooks.useUser).mockReturnValue({
      data: { id: 42, nickname: 'Me' },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: [
        { id: 1, nickname: 'Alice', friend_status: 'friends' },
        { id: 2, nickname: 'Bob', friend_status: 'requests' },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    expect(screen.getByText('Удалить из друзей')).toBeDisabled();
    expect(screen.getByText('Принять')).toBeDisabled();
  });

  it('shows the error message reported by useFriendActions', async () => {
    vi.mocked(hooks.useFriendActions).mockReturnValue({
      addFriend: vi.fn(),
      removeFriend: vi.fn(),
      pendingFriendIds: new Set(),
      error: 'Не удалось выполнить действие. Попробуйте ещё раз.',
      resetError: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useFriendActions>);
    vi.mocked(hooks.useUser).mockReturnValue({
      data: { id: 42, nickname: 'Me' },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: [{ id: 2, nickname: 'Bob', friend_status: 'requests' }],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();

    expect(screen.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toBeInTheDocument();
  });

  it('switches to a category tab and shows its empty state', async () => {
    vi.mocked(hooks.useUser).mockReturnValue({
      data: { id: 42, nickname: 'Me' },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();

    fireEvent.click(screen.getByText('Входящие заявки'));
    await waitFor(() => expect(screen.getByText('Нет входящих заявок в друзья')).toBeInTheDocument());
  });
});
