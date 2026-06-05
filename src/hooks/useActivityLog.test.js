import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useActivityLog } from './useActivityLog';
import { getLocalYYYYMMDD } from '../utils/helpers';
import { useLocalStorage } from './useLocalStorage';

vi.mock('../utils/helpers', () => ({
    getLocalYYYYMMDD: vi.fn(),
}));

vi.mock('./useLocalStorage', () => ({
    useLocalStorage: vi.fn(),
}));

describe('useActivityLog Hook', () => {
    let mockState;
    let setMockState;

    beforeEach(() => {
        vi.clearAllMocks();
        mockState = {};
        setMockState = vi.fn((update) => {
            if (typeof update === 'function') {
                mockState = update(mockState);
            } else {
                mockState = update;
            }
        });

        // Default mock implementation
        useLocalStorage.mockImplementation(() => [mockState, setMockState]);
    });

    it('initializes with empty state when no data in localStorage', () => {
        const { result } = renderHook(() => useActivityLog());
        expect(result.current.activityLog).toEqual({});
    });

    it('initializes with data from localStorage', () => {
        mockState = { 'deck-1': { '2023-10-01': 5 } };
        const { result } = renderHook(() => useActivityLog());
        expect(result.current.activityLog).toEqual({ 'deck-1': { '2023-10-01': 5 } });
    });

    it('logging an activity for a deck correctly updates the state', () => {
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1');
        });

        expect(mockState).toEqual({
            'deck-1': { '2023-10-02': 1 },
        });
    });

    it('multiple calls on the same day increment the count', () => {
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1');
            result.current.logStudyActivity('deck-1');
        });

        expect(mockState).toEqual({
            'deck-1': { '2023-10-02': 2 },
        });
    });

    it('custom count values are supported', () => {
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1', 5);
        });

        expect(mockState).toEqual({
            'deck-1': { '2023-10-02': 5 },
        });
    });

    it('missing deckId does not log anything', () => {
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity();
            result.current.logStudyActivity(null);
            result.current.logStudyActivity('');
        });

        expect(mockState).toEqual({});
    });

    it('handle null response from getLocalYYYYMMDD', () => {
        getLocalYYYYMMDD.mockReturnValue(null);
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1');
        });

        expect(mockState).toEqual({});
    });

    it('data for multiple decks is tracked independently', () => {
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1', 2);
            result.current.logStudyActivity('deck-2', 3);
        });

        expect(mockState).toEqual({
            'deck-1': { '2023-10-02': 2 },
            'deck-2': { '2023-10-02': 3 },
        });
    });

    it('logs correctly append to existing past dates instead of overwriting', () => {
        mockState = { 'deck-1': { '2023-10-01': 5 } };
        getLocalYYYYMMDD.mockReturnValue('2023-10-02');
        const { result } = renderHook(() => useActivityLog());

        act(() => {
            result.current.logStudyActivity('deck-1', 2);
        });

        expect(mockState).toEqual({
            'deck-1': { '2023-10-01': 5, '2023-10-02': 2 },
        });
    });

    it('calls useLocalStorage with correct key', () => {
        renderHook(() => useActivityLog());
        expect(useLocalStorage).toHaveBeenCalledWith('quiz_activity_log', {});
    });
});
