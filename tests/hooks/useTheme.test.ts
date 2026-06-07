import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useTheme hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('returns system as default theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('sets light theme', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('anihako-theme', 'light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('sets dark theme', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('anihako-theme', 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets system theme', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.theme).toBe('system');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('anihako-theme', 'system');
  });

  it('loads theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });
});