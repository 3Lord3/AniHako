import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserByNickname } from '@/hooks/useUsers';
import { usersApi } from '@/api/users';

vi.mock('@/api/users', () => ({
  usersApi: {
    getByNickname: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserByNickname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a user profile by nickname', async () => {
    vi.mocked(usersApi.getByNickname).mockResolvedValueOnce({ id: 5, nickname: 'foo' } as never);

    const { result } = renderHook(() => useUserByNickname('foo'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.getByNickname).toHaveBeenCalledWith('foo');
    expect(result.current.data).toEqual({ id: 5, nickname: 'foo' });
  });

  it('does not run when nickname is undefined', () => {
    renderHook(() => useUserByNickname(undefined), { wrapper: createWrapper() });

    expect(usersApi.getByNickname).not.toHaveBeenCalled();
  });

  it('does not run when explicitly disabled', () => {
    renderHook(() => useUserByNickname('foo', { enabled: false }), { wrapper: createWrapper() });

    expect(usersApi.getByNickname).not.toHaveBeenCalled();
  });
});
