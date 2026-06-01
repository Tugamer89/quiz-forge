import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage Hook', () => {
    const TEST_KEY = 'quiz-forge-test-key';
    const INITIAL_VALUE = 'initial_data';

    beforeEach(() => {
        globalThis.localStorage.clear();
        vi.clearAllMocks();
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

    it('handles errors when setting localStorage', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));

        act(() => {
            const setValue = result.current[1];
            try {
                setValue('new_data');
            } catch {
                // Ignore the error here, we expect console.error to have caught it inside the hook,
                // but if it's thrown from inside setStoredValue it might escape
            }
        });

        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        setItemSpy.mockRestore();
    });

    it('handles JSON.parse error and returns initialValue when localStorage contains invalid JSON', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        globalThis.localStorage.setItem(TEST_KEY, 'invalid-json');

        const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));

        expect(result.current[0]).toBe(INITIAL_VALUE);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
