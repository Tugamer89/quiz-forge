import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAppUI } from './useAppUI';
import * as Sentry from '@sentry/react';

// Mock dependencies
vi.mock('@sentry/react', () => ({
    setUser: vi.fn(),
    setTag: vi.fn(),
}));

vi.mock('lucide-react', () => ({
    Smartphone: () => <div data-testid="smartphone-icon" />,
}));

describe('useAppUI Hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        globalThis.localStorage.clear();
        vi.clearAllMocks();

        // Setup matchMedia mock
        Object.defineProperty(globalThis, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Mock document.documentElement classList and style
        Object.defineProperty(document, 'documentElement', {
            value: {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn(),
                },
                style: {
                    colorScheme: '',
                },
            },
            configurable: true,
        });

        // Mock crypto.randomUUID
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                randomUUID: vi.fn(() => 'test-uuid-1234'),
            },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Initialization & Sentry', () => {
        it('should generate and store user ID if not exists, and set Sentry user', () => {
            renderHook(() => useAppUI());

            expect(globalThis.crypto.randomUUID).toHaveBeenCalled();
            expect(globalThis.localStorage.getItem('quiz_user_id')).toBe('test-uuid-1234');
            expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'test-uuid-1234' });
        });

        it('should use existing user ID from localStorage and set Sentry user', () => {
            globalThis.localStorage.setItem('quiz_user_id', 'existing-uuid-5678');

            renderHook(() => useAppUI());

            expect(globalThis.crypto.randomUUID).not.toHaveBeenCalled();
            expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'existing-uuid-5678' });
        });
    });

    describe('Theme Management', () => {
        it('should initialize with light mode by default', () => {
            const { result } = renderHook(() => useAppUI());

            expect(result.current.isDarkMode).toBe(false);
            expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
            expect(document.documentElement.style.colorScheme).toBe('light');
            expect(Sentry.setTag).toHaveBeenCalledWith('theme', 'light');
        });

        it('should toggle theme and update DOM/Sentry', () => {
            const { result } = renderHook(() => useAppUI());

            act(() => {
                result.current.toggleTheme();
            });

            expect(result.current.isDarkMode).toBe(true);
            expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
            expect(document.documentElement.style.colorScheme).toBe('dark');
            expect(Sentry.setTag).toHaveBeenCalledWith('theme', 'dark');

            expect(globalThis.localStorage.getItem('quiz_theme_dark')).toBe('true');
        });
    });

    describe('Toast Notifications', () => {
        it('should show toast with default values and auto-hide after 3000ms', () => {
            const { result } = renderHook(() => useAppUI());

            act(() => {
                result.current.showToast('Test message');
            });

            expect(result.current.toast.show).toBe(true);
            expect(result.current.toast.message).toBe('Test message');
            expect(result.current.toast.type).toBe('info');
            expect(result.current.toast.duration).toBe(3000);

            // Advance time to auto-hide
            act(() => {
                vi.advanceTimersByTime(3000);
            });

            expect(result.current.toast.show).toBe(false);
        });

        it('should set duration to 6000ms for messages containing "drive"', () => {
            const { result } = renderHook(() => useAppUI());

            act(() => {
                result.current.showToast('Please check your Google Drive');
            });

            expect(result.current.toast.duration).toBe(6000);
        });

        it('should clear previous timeout when showing a new toast', () => {
            const { result } = renderHook(() => useAppUI());

            act(() => {
                result.current.showToast('Message 1');
            });

            act(() => {
                vi.advanceTimersByTime(1500); // Wait half time
                result.current.showToast('Message 2'); // Should reset timer
            });

            act(() => {
                vi.advanceTimersByTime(1500); // Original timer would have fired here
            });

            expect(result.current.toast.show).toBe(true); // Should still be showing

            act(() => {
                vi.advanceTimersByTime(1500); // Second timer finishes
            });

            expect(result.current.toast.show).toBe(false); // Now it should hide
        });
    });

    describe('PWA and Install Logic', () => {
        let originalUserAgent;

        beforeEach(() => {
            originalUserAgent = navigator.userAgent;
        });

        afterEach(() => {
            Object.defineProperty(navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true,
            });
            vi.restoreAllMocks();
        });

        it('should handle beforeinstallprompt event', () => {
            let addEventListenerCallback;
            const mockAddEventListener = vi
                .spyOn(globalThis, 'addEventListener')
                .mockImplementation((event, cb) => {
                    if (event === 'beforeinstallprompt') {
                        addEventListenerCallback = cb;
                    }
                });

            const { result } = renderHook(() => useAppUI());

            const mockEvent = { preventDefault: vi.fn() };

            act(() => {
                if (addEventListenerCallback) addEventListenerCallback(mockEvent);
            });

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(result.current.deferredPrompt).toBe(mockEvent);

            mockAddEventListener.mockRestore();
        });

        it('should auto-prompt for PWA installation on mobile after 45s if not installed or prompted', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                configurable: true,
            });

            let addEventListenerCallback;
            vi.spyOn(globalThis, 'addEventListener').mockImplementation((event, cb) => {
                if (event === 'beforeinstallprompt') {
                    addEventListenerCallback = cb;
                }
            });

            const { result } = renderHook(() => useAppUI());

            act(() => {
                if (addEventListenerCallback)
                    addEventListenerCallback({
                        preventDefault: vi.fn(),
                        prompt: vi.fn(),
                        userChoice: Promise.resolve({ outcome: 'accepted' }),
                    });
            });

            act(() => {
                vi.advanceTimersByTime(45000);
            });

            expect(result.current.dialog.isOpen).toBe(true);
            expect(result.current.dialog.title).toBe('Install Quiz Forge');
            expect(globalThis.localStorage.getItem('quiz_pwa_prompted')).toBe('true');
        });

        it('should not auto-prompt for PWA installation if already prompted', () => {
            globalThis.localStorage.setItem('quiz_pwa_prompted', 'true');
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                configurable: true,
            });

            const { result } = renderHook(() => useAppUI());

            act(() => {
                vi.advanceTimersByTime(45000);
            });

            expect(result.current.dialog.isOpen).toBe(false);
        });

        it('should accept install prompt successfully', async () => {
            let addEventListenerCallback;
            vi.spyOn(globalThis, 'addEventListener').mockImplementation((event, cb) => {
                if (event === 'beforeinstallprompt') {
                    addEventListenerCallback = cb;
                }
            });

            const { result } = renderHook(() => useAppUI());

            const mockPrompt = vi.fn();
            const mockUserChoice = Promise.resolve({ outcome: 'accepted' });

            act(() => {
                if (addEventListenerCallback)
                    addEventListenerCallback({
                        preventDefault: vi.fn(),
                        prompt: mockPrompt,
                        userChoice: mockUserChoice,
                    });
            });

            await act(async () => {
                await result.current.handleInstallApp();
            });

            expect(mockPrompt).toHaveBeenCalled();
            expect(result.current.toast.show).toBe(true);
            expect(result.current.toast.message).toBe('Thank you for installing Quiz Forge!');
            expect(result.current.toast.type).toBe('success');
            expect(result.current.deferredPrompt).toBe(null);
        });
    });
});
