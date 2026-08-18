import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useAuth, useUser } from '@/hooks/useAuth';
import * as authApiModule from '@/api/auth';
import * as apiIndex from '@/api';

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  },
}));

vi.mock('@/api', () => ({
  setAuthToken: vi.fn(),
  clearAuth: vi.fn(),
  setUser: vi.fn(),
  getUser: vi.fn(),
}));

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
      vi.mocked(authApiModule.authApi.login).mockResolvedValueOnce({
        data: { response: { success: true, token: 'test-token' } }
      } as never);
      vi.mocked(authApiModule.authApi.getProfile).mockResolvedValueOnce({
        id: 1, email: 'test@test.com', username: 'testuser'
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(authApiModule.authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    it('stores token in localStorage on successful login', async () => {
      vi.mocked(authApiModule.authApi.login).mockResolvedValueOnce({
        data: { response: { success: true, token: 'test-token' } }
      } as never);
      vi.mocked(authApiModule.authApi.getProfile).mockResolvedValueOnce({
        id: 1, email: 'test@test.com', username: 'testuser'
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'password123' });

      await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
      expect(apiIndex.setAuthToken).toHaveBeenCalledWith('test-token');
    });

    it('sets error state on failed login', async () => {
      vi.mocked(authApiModule.authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.login({ login: 'test@test.com', password: 'wrong' });

      await waitFor(() => expect(result.current.loginError).toBeDefined());
    });
  });

  describe('register', () => {
    it('calls register API with correct data', async () => {
      vi.mocked(authApiModule.authApi.register).mockResolvedValueOnce({
        data: { user: { id: 1, email: 'test@test.com', username: 'testuser' }, tokens: { access_token: 'test-token' } }
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(authApiModule.authApi.register).toHaveBeenCalledWith('test@test.com', 'testuser', 'password123');
    });

    it('stores token in localStorage on successful register', async () => {
      vi.mocked(authApiModule.authApi.register).mockResolvedValueOnce({
        data: { user: { id: 1, email: 'test@test.com', username: 'testuser' }, tokens: { access_token: 'test-token' } }
      } as never);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.register({ email: 'test@test.com', username: 'testuser', password: 'password123' });

      await waitFor(() => expect(result.current.isRegistering).toBe(false));
      expect(apiIndex.setAuthToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears localStorage on logout', async () => {
      vi.mocked(authApiModule.authApi.logout).mockResolvedValueOnce({} as never);

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

      result.current.logout();

      await waitFor(() => expect(apiIndex.clearAuth).toHaveBeenCalled());
    });
  });
});

describe('useUser', () => {
   beforeEach(() => {
     vi.clearAllMocks();
     localStorage.clear();
   });

   it('returns null when no token in localStorage', async () => {
     localStorage.removeItem('auth_token');
     vi.mocked(apiIndex.getUser).mockReturnValueOnce(null);

     const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

     await waitFor(() => expect(result.current.isSuccess).toBe(true));
     expect(result.current.data).toBeNull();
   });

   it('fetches profile when token exists but no user in localStorage', async () => {
     const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
     localStorage.setItem('auth_token', 'existing-token');
     vi.mocked(apiIndex.getUser).mockReturnValueOnce(null);
     vi.mocked(authApiModule.authApi.getProfile).mockResolvedValueOnce(mockUser as never);

     const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

     await waitFor(() => expect(result.current.isSuccess).toBe(true));
     expect(result.current.data).toEqual(mockUser);
   });
 });