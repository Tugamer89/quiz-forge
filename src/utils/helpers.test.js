import { describe, it, expect } from 'vitest';
import { getLocalYYYYMMDD } from './helpers';

describe('getLocalYYYYMMDD', () => {
    it('returns the correct date string for a valid Date object', () => {
        const date = new Date('2023-10-15T12:00:00Z');
        // We need to account for the local timezone when testing,
        // but since the function calculates local YYYY-MM-DD, we can check its functionality
        // by verifying the output format and that it matches the local date of the object.
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        const expected = localDate.toISOString().split('T')[0];

        expect(getLocalYYYYMMDD(date)).toBe(expected);
    });

    it('uses the current date if no argument is provided', () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60 * 1000);
        const expected = localDate.toISOString().split('T')[0];

        // Since there could be a slight delay, we just check that it returns a valid date string
        const result = getLocalYYYYMMDD();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // It should be either expected date or very close to it
        expect(result).toBe(expected);
    });

    it('returns null for an invalid Date object', () => {
        expect(getLocalYYYYMMDD(new Date('invalid'))).toBeNull();
    });

    it('returns null for non-Date objects', () => {
        expect(getLocalYYYYMMDD('2023-10-15')).toBeNull();
        expect(getLocalYYYYMMDD(1697371200000)).toBeNull();
        expect(getLocalYYYYMMDD(null)).toBeNull();
        expect(getLocalYYYYMMDD({})).toBeNull();
        expect(getLocalYYYYMMDD([])).toBeNull();
    });
});
