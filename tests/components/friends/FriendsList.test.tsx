import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FriendsList } from '@/components/friends/FriendsList';
import type { YummyFriend } from '@/types/friend';

const friends: YummyFriend[] = [
  { id: 1, nickname: 'Alice', friend_status: 'friends' },
  { id: 2, nickname: 'Bob', friend_status: 'followers' },
];

describe('FriendsList', () => {
  it('renders skeleton rows while loading', () => {
    const { container } = render(
      <FriendsList
        friends={undefined}
        isLoading
        emptyMessage="empty"
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders the empty message when there are no friends', () => {
    render(
      <FriendsList friends={[]} isLoading={false} emptyMessage="Пусто" onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText('Пусто')).toBeInTheDocument();
  });

  it('renders a row per friend', () => {
    render(
      <FriendsList friends={friends} isLoading={false} emptyMessage="empty" onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders an error message instead of the empty state when the fetch failed', () => {
    render(
      <FriendsList
        friends={undefined}
        isLoading={false}
        isError
        emptyMessage="Пусто"
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText('Не удалось загрузить список. Попробуйте обновить страницу.')).toBeInTheDocument();
    expect(screen.queryByText('Пусто')).not.toBeInTheDocument();
  });

  it('marks only the friends present in pendingFriendIds as pending', () => {
    render(
      <FriendsList
        friends={friends}
        isLoading={false}
        emptyMessage="empty"
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        pendingFriendIds={new Set([2])}
      />
    );
    expect(screen.getByText('Удалить из друзей')).not.toBeDisabled();
    expect(screen.getByText('Добавить в друзья')).toBeDisabled();
  });
});
