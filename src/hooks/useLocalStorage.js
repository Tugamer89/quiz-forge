import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = globalThis.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            Sentry.captureException(error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value) => {
            try {
                const valueToStore = typeof value === 'function' ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (globalThis.window !== undefined) {
                    globalThis.window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                Sentry.captureException(error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}
