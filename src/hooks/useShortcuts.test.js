import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShortcuts } from './useShortcuts';

describe('useShortcuts Hook', () => {
    let callbacks;

    beforeEach(() => {
        callbacks = {
            onFlip: vi.fn(),
            onGradeWrong: vi.fn(),
            onGradePartial: vi.fn(),
            onGradeCorrect: vi.fn(),
            onExit: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const fireKeyDown = (key, options = {}) => {
        const event = new KeyboardEvent('keydown', { key, ...options });
        globalThis.dispatchEvent(event);
    };

    it('calls onFlip when Space is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown(' ');
        expect(callbacks.onFlip).toHaveBeenCalledTimes(1);
    });

    it('calls onFlip when Enter is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('Enter');
        expect(callbacks.onFlip).toHaveBeenCalledTimes(1);
    });

    it('calls onGradeWrong when 1 is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('1');
        expect(callbacks.onGradeWrong).toHaveBeenCalledTimes(1);
    });

    it('calls onGradePartial when 2 is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('2');
        expect(callbacks.onGradePartial).toHaveBeenCalledTimes(1);
    });

    it('calls onGradeCorrect when 3 is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('3');
        expect(callbacks.onGradeCorrect).toHaveBeenCalledTimes(1);
    });

    it('calls onExit when Escape is pressed', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('Escape');
        expect(callbacks.onExit).toHaveBeenCalledTimes(1);
    });

    it('does not call any callback for unhandled keys', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown('a');
        fireKeyDown('Shift');

        expect(callbacks.onFlip).not.toHaveBeenCalled();
        expect(callbacks.onGradeWrong).not.toHaveBeenCalled();
        expect(callbacks.onGradePartial).not.toHaveBeenCalled();
        expect(callbacks.onGradeCorrect).not.toHaveBeenCalled();
        expect(callbacks.onExit).not.toHaveBeenCalled();
    });

    it('does not call callbacks when event is repeated', () => {
        renderHook(() => useShortcuts(callbacks));
        fireKeyDown(' ', { repeat: true });
        fireKeyDown('1', { repeat: true });

        expect(callbacks.onFlip).not.toHaveBeenCalled();
        expect(callbacks.onGradeWrong).not.toHaveBeenCalled();
    });

    it('does not call callbacks when active element is INPUT', () => {
        renderHook(() => useShortcuts(callbacks));

        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        fireKeyDown(' ');
        fireKeyDown('1');

        expect(callbacks.onFlip).not.toHaveBeenCalled();
        expect(callbacks.onGradeWrong).not.toHaveBeenCalled();

        input.remove();
    });

    it('does not call callbacks when active element is TEXTAREA', () => {
        renderHook(() => useShortcuts(callbacks));

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();

        fireKeyDown(' ');
        fireKeyDown('1');

        expect(callbacks.onFlip).not.toHaveBeenCalled();
        expect(callbacks.onGradeWrong).not.toHaveBeenCalled();

        textarea.remove();
    });

    it('removes event listener on unmount', () => {
        const { unmount } = renderHook(() => useShortcuts(callbacks));
        unmount();

        fireKeyDown(' ');

        expect(callbacks.onFlip).not.toHaveBeenCalled();
    });
});
