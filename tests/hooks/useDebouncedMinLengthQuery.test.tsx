import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebouncedMinLengthQuery } from '@/hooks/useDebouncedMinLengthQuery';

describe('useDebouncedMinLengthQuery', () => {
  it('reports isQueryLongEnough based on the trimmed length', () => {
    const { result } = renderHook(() => useDebouncedMinLengthQuery('ab', 3));
    expect(result.current.isQueryLongEnough).toBe(false);
  });

  it('trims surrounding whitespace for the length check but not the debounced value', () => {
    const { result } = renderHook(() => useDebouncedMinLengthQuery('  abc  ', 3));
    expect(result.current.trimmedQuery).toBe('abc');
    expect(result.current.isQueryLongEnough).toBe(true);
    expect(result.current.debouncedQuery).toBe('  abc  ');
  });
});
