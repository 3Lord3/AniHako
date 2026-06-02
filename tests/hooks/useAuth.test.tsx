import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuth, useUser } from '@/hooks/useAuth';
import * as apiModule from '@/lib/api';

vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  },
  setAuthToken: vi.fn(),
  clearAuth: vi.fn(),
  setUser: vi.fn(),
  getUser: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

const setLocalStorageMock = (storage: Record<string, string>) => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
    },
    writable: true,
  });
};

describe('useAuth', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {};
    setLocalStorageMock(storage);
  });

  describe('login', () => {
    it('calls login API with correct credentials', async () => {
      vi.mocked(apiModule.authApi.login).mockResolvedValueOnce({
        data: { response: { success: true, token: 'test-token' } }
      } as any);
      vi.mocked(apiModule.authApi.getProfile).mockResolvedValueOnce({
        data: { id: 1, email: 'test@test.com', username: 'testuser' }
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(apiModule.authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    it('stores token in localStorage on successful login', async () => {
      vi.mocked(apiModule.authApi.login).mockResolvedValueOnce({
        data: { response: { success: true, token: 'test-token' } }
      } as any);
      vi.mocked(apiModule.authApi.getProfile).mockResolvedValueOnce({
        data: { id: 1, email: 'test@test.com', username: 'testuser' }
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(apiModule.setAuthToken).toHaveBeenCalledWith('test-token');
    });

    it('sets error state on failed login', async () => {
      vi.mocked(apiModule.authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'wrong' });

      await waitFor(() => expect(result.current.loginError).toBeDefined());
    });
  });

  describe('register', () => {
    it('calls register API with correct data', async () => {
      vi.mocked(apiModule.authApi.register).mockResolvedValueOnce({
        data: { user: { id: 1, email: 'test@test.com', username: 'testuser' }, tokens: { access_token: 'test-token' } }
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(apiModule.authApi.register).toHaveBeenCalledWith('test@test.com', 'testuser', 'password123');
    });

    it('stores token in localStorage on successful register', async () => {
      vi.mocked(apiModule.authApi.register).mockResolvedValueOnce({
        data: { user: { id: 1, email: 'test@test.com', username: 'testuser' }, tokens: { access_token: 'test-token' } }
      } as any);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(apiModule.setAuthToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears localStorage on logout', () => {
      vi.mocked(apiModule.authApi.logout).mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.logout();

      expect(apiModule.clearAuth).toHaveBeenCalled();
    });
  });
});

describe('useUser', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storage = {};
    setLocalStorageMock(storage);
  });

  it('returns null when no token in localStorage', async () => {
    vi.mocked(apiModule.getUser).mockReturnValueOnce(null);

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns user from localStorage when available', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
    vi.mocked(apiModule.getUser).mockReturnValueOnce(mockUser as any);

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
  });

  it('fetches profile when token exists but no user in localStorage', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
    vi.mocked(apiModule.getUser).mockReturnValueOnce(null);
    vi.mocked(apiModule.authApi.getProfile).mockResolvedValueOnce(mockUser as any);

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(apiModule.setUser).toHaveBeenCalledWith(mockUser);
  });
});