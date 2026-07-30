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
    useAddFriend: vi.fn(),
    useRemoveFriend: vi.fn(),
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
    vi.mocked(hooks.useAddFriend).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: undefined,
    } as unknown as ReturnType<typeof hooks.useAddFriend>);
    vi.mocked(hooks.useRemoveFriend).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      variables: undefined,
    } as unknown as ReturnType<typeof hooks.useRemoveFriend>);
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

  it('keeps multiple friends marked pending simultaneously instead of only the latest one', async () => {
    const addFriendMutate = vi.fn();
    const removeFriendMutate = vi.fn();
    vi.mocked(hooks.useAddFriend).mockReturnValue({
      mutate: addFriendMutate,
    } as unknown as ReturnType<typeof hooks.useAddFriend>);
    vi.mocked(hooks.useRemoveFriend).mockReturnValue({
      mutate: removeFriendMutate,
    } as unknown as ReturnType<typeof hooks.useRemoveFriend>);
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

    fireEvent.click(screen.getByText('Удалить из друзей'));
    fireEvent.click(screen.getByText('Принять'));

    await waitFor(() => {
      expect(screen.getByText('Удалить из друзей')).toBeDisabled();
      expect(screen.getByText('Принять')).toBeDisabled();
    });
  });

  it('shows an error message when an action mutation fails', async () => {
    const failingAdd = vi.fn((_id, opts) => opts?.onError?.());
    vi.mocked(hooks.useAddFriend).mockReturnValue({
      mutate: failingAdd,
    } as unknown as ReturnType<typeof hooks.useAddFriend>);
    vi.mocked(hooks.useUser).mockReturnValue({
      data: { id: 42, nickname: 'Me' },
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUser>);
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: [{ id: 2, nickname: 'Bob', friend_status: 'requests' }],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useFriends>);

    renderPage();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Принять'));

    await waitFor(() =>
      expect(screen.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toBeInTheDocument()
    );
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
