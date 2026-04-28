import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  const TEST_KEY = 'quiz-forge-test-key';
  const INITIAL_VALUE = 'initial_data';

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('returns the initial value if there is no data in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));

    expect(result.current[0]).toBe(INITIAL_VALUE);
  });

  it('returns the stored value if the data already exists in localStorage', () => {
    globalThis.localStorage.setItem(TEST_KEY, JSON.stringify('saved_data'));

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));

    expect(result.current[0]).toBe('saved_data');
  });

  it('updates both state and localStorage when the setter is called', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));

    act(() => {
      const setValue = result.current[1];
      setValue('new_data');
    });

    expect(result.current[0]).toBe('new_data');
    expect(globalThis.localStorage.getItem(TEST_KEY)).toBe(JSON.stringify('new_data'));
  });
});
