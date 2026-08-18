import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createWrapper } from '../utils/queryWrapper';
import { useRegisterForm } from '@/hooks/useRegisterForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockRegister = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ register: mockRegister, isRegistering: false }),
}));

const submitEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

const fillValidForm = (result: { current: ReturnType<typeof useRegisterForm> }) => {
  act(() => {
    result.current.setEmail('a@example.com');
    result.current.setUsername('nickname');
    result.current.setPassword('secret1');
    result.current.setConfirmPassword('secret1');
    result.current.setAcceptRules(true);
    result.current.setAcceptPrivacy(true);
  });
};

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and surfaces the validation error without calling register', () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper: createWrapper() });

    act(() => {
      result.current.setPassword('secret1');
      result.current.setConfirmPassword('other12');
    });
    act(() => {
      result.current.handleSubmit(submitEvent);
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Пароли не совпадают');
  });

  it('submits valid data and navigates home on success', () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper: createWrapper() });
    fillValidForm(result);

    act(() => {
      result.current.handleSubmit(submitEvent);
    });

    expect(mockRegister).toHaveBeenCalledWith(
      { email: 'a@example.com', username: 'nickname', password: 'secret1' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );

    act(() => {
      mockRegister.mock.calls[0][1].onSuccess();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('sets the server error message on failed registration', () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper: createWrapper() });
    fillValidForm(result);

    act(() => {
      result.current.handleSubmit(submitEvent);
    });
    act(() => {
      mockRegister.mock.calls[0][1].onError({ response: { data: { detail: 'Email занят' } } });
    });

    expect(result.current.error).toBe('Email занят');
  });
});
