import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FriendRow } from '@/components/friends/FriendRow';
import type { YummyFriend } from '@/types/friend';

const baseFriend: YummyFriend = {
  id: 7,
  nickname: 'Kanade',
  friend_status: 'friends',
  last_online: Math.floor(Date.now() / 1000),
  roles: ['moderator'],
};

describe('FriendRow', () => {
  it('renders nickname and status badge', () => {
    render(<FriendRow friend={baseFriend} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Kanade')).toBeInTheDocument();
    expect(screen.getByText('Друзья')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<FriendRow friend={baseFriend} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('moderator')).toBeInTheDocument();
  });

  it('shows a banned badge when the friend is banned', () => {
    render(<FriendRow friend={{ ...baseFriend, banned: true }} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Заблокирован')).toBeInTheDocument();
  });

  it('calls onRemove with the friend id for a mutual friend', () => {
    const onRemove = vi.fn();
    render(<FriendRow friend={baseFriend} onAdd={vi.fn()} onRemove={onRemove} />);

    fireEvent.click(screen.getByText('Удалить из друзей'));
    expect(onRemove).toHaveBeenCalledWith(7);
  });

  it('renders accept/decline actions for incoming requests', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(
      <FriendRow
        friend={{ ...baseFriend, friend_status: 'requests' }}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByText('Принять'));
    expect(onAdd).toHaveBeenCalledWith(7);

    fireEvent.click(screen.getByText('Отклонить'));
    expect(onRemove).toHaveBeenCalledWith(7);
  });

  it('disables action buttons while pending', () => {
    render(<FriendRow friend={baseFriend} onAdd={vi.fn()} onRemove={vi.fn()} isPending />);
    expect(screen.getByText('Удалить из друзей')).toBeDisabled();
  });

  it('disables action buttons for a banned friend even when not pending', () => {
    render(<FriendRow friend={{ ...baseFriend, banned: true }} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Удалить из друзей')).toBeDisabled();
  });
});
