import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddFriendDialog } from '@/components/friends/AddFriendDialog';
import * as hooks from '@/hooks';
import type { YummyFriend } from '@/types/friend';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useFriends: vi.fn(),
    useFriendStatus: vi.fn(),
    useUserByNickname: vi.fn(),
    useAddFriend: vi.fn(),
    useRemoveFriend: vi.fn(),
  };
});

const knownRelations: YummyFriend[] = [
  { id: 42, nickname: 'Kaworu', friend_status: 'friends' },
  { id: 43, nickname: 'Rei', friend_status: 'requests' },
];

describe('AddFriendDialog', () => {
  const addFriend = vi.fn();
  const removeFriend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useFriends).mockReturnValue({
      data: knownRelations,
    } as unknown as ReturnType<typeof hooks.useFriends>);
    vi.mocked(hooks.useAddFriend).mockReturnValue({
      mutate: addFriend,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useAddFriend>);
    vi.mocked(hooks.useRemoveFriend).mockReturnValue({
      mutate: removeFriend,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useRemoveFriend>);
    vi.mocked(hooks.useFriendStatus).mockReturnValue({
      data: undefined,
      isFetching: false,
    } as unknown as ReturnType<typeof hooks.useFriendStatus>);
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: undefined,
      isFetching: false,
      isFetched: false,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);
  });

  it('opens the dialog with no description and no placeholder on the input', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    expect(screen.getByText('Никнейм или ID пользователя')).toBeInTheDocument();
    expect(screen.queryByText(/статус отношений/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Никнейм или ID пользователя')).not.toHaveAttribute('placeholder');
  });

  it('triggers the check on Enter, same as clicking "Проверить"', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    const input = screen.getByLabelText('Никнейм или ID пользователя');
    fireEvent.change(input, { target: { value: 'kaworu' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Kaworu')).toBeInTheDocument();
    expect(screen.getByText('Друзья')).toBeInTheDocument();
  });

  it('rejects an empty submission', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Введите никнейм или ID пользователя')).toBeInTheDocument();
  });

  it('rejects adding yourself by numeric id', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Нельзя добавить самого себя')).toBeInTheDocument();
  });

  it('rejects adding yourself by nickname (case-insensitive)', () => {
    render(<AddFriendDialog userId={1} userNickname="Nagisa" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'nagisa' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Нельзя добавить самого себя')).toBeInTheDocument();
  });

  it('resolves a nickname that is already a known relation without any lookup', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'kaworu' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Kaworu')).toBeInTheDocument();
    expect(screen.getByText('Друзья')).toBeInTheDocument();
    expect(screen.queryByText('Вы ещё не связаны')).not.toBeInTheDocument();
    expect(hooks.useUserByNickname).toHaveBeenLastCalledWith(undefined);
    expect(hooks.useFriendStatus).toHaveBeenLastCalledWith(1, 42, { enabled: false });
  });

  it('resolves an unknown nickname via GET /users/{nickname} and checks its status by the resolved id', async () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: { id: 77, nickname: 'Stranger' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'Stranger' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(hooks.useUserByNickname).toHaveBeenLastCalledWith('Stranger');
    await waitFor(() => expect(screen.getByText('Вы ещё не связаны')).toBeInTheDocument());
    expect(screen.getByText('Stranger')).toBeInTheDocument();
    expect(hooks.useFriendStatus).toHaveBeenLastCalledWith(1, 77, { enabled: true });
    expect(screen.getByText('Отправить заявку')).toBeInTheDocument();
  });

  it('shows a not-found error when the nickname does not resolve to any user', () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: undefined,
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'Ghost' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Пользователь с таким никнеймом или ID не найден')).toBeInTheDocument();
  });

  it('resolves a numeric id that matches a known relation without any remote lookup', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: '42' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Kaworu')).toBeInTheDocument();
    expect(screen.getByText('Друзья')).toBeInTheDocument();
    expect(hooks.useUserByNickname).toHaveBeenLastCalledWith(undefined);
  });

  it('resolves an unknown numeric id via GET /users/{id} before checking its status', async () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: { id: 99, nickname: 'NewPerson' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: '99' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(hooks.useUserByNickname).toHaveBeenLastCalledWith('99');
    await waitFor(() => expect(screen.getByText('Вы ещё не связаны')).toBeInTheDocument());
    expect(screen.getByText('NewPerson')).toBeInTheDocument();
    expect(hooks.useFriendStatus).toHaveBeenLastCalledWith(1, 99, { enabled: true });
    expect(screen.getByText('Отправить заявку')).toBeInTheDocument();
  });

  it('shows a not-found error for a numeric id that does not resolve to any user', () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: undefined,
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: '999999999' } });
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('Пользователь с таким никнеймом или ID не найден')).toBeInTheDocument();
    expect(screen.queryByText('Отправить заявку')).not.toBeInTheDocument();
  });

  it('blocks the action if the resolved identity turns out to be the caller, even if the typed string was not a literal self-match', async () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: { id: 1, nickname: 'CanonicalMe' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'alias-for-me' } });
    fireEvent.click(screen.getByText('Проверить'));

    await waitFor(() => expect(screen.getByText('Нельзя добавить самого себя')).toBeInTheDocument());
    expect(screen.queryByText('Отправить заявку')).not.toBeInTheDocument();
  });

  it('accepts an incoming request resolved from a known nickname', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'Rei' } });
    fireEvent.click(screen.getByText('Проверить'));

    fireEvent.click(screen.getByText('Принять'));
    expect(addFriend).toHaveBeenCalledWith(43, expect.anything());
  });

  it('shows an error message when the mutation fails', () => {
    const failingAddFriend = vi.fn((_id, opts) => opts?.onError?.());
    vi.mocked(hooks.useAddFriend).mockReturnValue({
      mutate: failingAddFriend,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useAddFriend>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'Rei' } });
    fireEvent.click(screen.getByText('Проверить'));
    fireEvent.click(screen.getByText('Принять'));

    expect(screen.getByText('Не удалось выполнить действие. Попробуйте ещё раз.')).toBeInTheDocument();
  });

  it('sends a friend request to a remotely-resolved user by their looked-up id', async () => {
    vi.mocked(hooks.useUserByNickname).mockReturnValue({
      data: { id: 77, nickname: 'Stranger' },
      isFetching: false,
      isFetched: true,
    } as unknown as ReturnType<typeof hooks.useUserByNickname>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    fireEvent.change(screen.getByLabelText('Никнейм или ID пользователя'), { target: { value: 'Stranger' } });
    fireEvent.click(screen.getByText('Проверить'));

    await waitFor(() => expect(screen.getByText('Отправить заявку')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Отправить заявку'));
    expect(addFriend).toHaveBeenCalledWith(77, expect.anything());
  });
});
