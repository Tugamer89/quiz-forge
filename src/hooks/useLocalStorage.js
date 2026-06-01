import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = globalThis.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value) => {
            try {
                const valueToStore = typeof value === 'function' ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}
