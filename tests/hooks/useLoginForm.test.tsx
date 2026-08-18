import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useLoginForm } from '@/hooks/useLoginForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin, isLoggingIn: false }),
}));

const submitEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits current login/password and navigates home on success', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.setLogin('nick');
      result.current.setPassword('secret');
    });
    act(() => {
      result.current.handleSubmit(submitEvent);
    });

    expect(mockLogin).toHaveBeenCalledWith(
      { login: 'nick', password: 'secret' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );

    act(() => {
      mockLogin.mock.calls[0][1].onSuccess();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('sets the server error message on failed login', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.handleSubmit(submitEvent);
    });
    act(() => {
      mockLogin.mock.calls[0][1].onError({ response: { data: { detail: 'Неверный пароль' } } });
    });

    expect(result.current.error).toBe('Неверный пароль');
  });
});
