import { describe, it, expect } from 'vitest';
import { getLocalYYYYMMDD, extractTags } from './helpers';

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

describe('extractTags', () => {
    it('returns an empty array when there are no tags', () => {
        expect(extractTags('This is a text without tags')).toEqual([]);
    });

    it('returns a single tag', () => {
        expect(extractTags('This is a text with #one tag')).toEqual(['#one']);
    });

    it('returns multiple tags', () => {
        expect(extractTags('This is a text with #multiple #tags')).toEqual(['#multiple', '#tags']);
    });

    it('returns unique tags even if there are duplicates', () => {
        expect(extractTags('This text has #duplicate #tags and #duplicate #tags')).toEqual([
            '#duplicate',
            '#tags',
        ]);
    });

    it('returns tags in lowercase', () => {
        expect(extractTags('This text has #MIXEDCase #TAGS')).toEqual(['#mixedcase', '#tags']);
    });

    it('ignores tags inside backticks', () => {
        expect(extractTags('This text has a tag `#inside` backticks and #outside')).toEqual([
            '#outside',
        ]);
    });

    it('ignores tags inside triple backticks', () => {
        expect(extractTags('This text has ```\n#inside\n``` and #outside')).toEqual(['#outside']);
    });

    it('returns an empty array when input is null or undefined', () => {
        expect(extractTags(null)).toEqual([]);
        expect(extractTags(undefined)).toEqual([]);
    });

    it('handles empty strings', () => {
        expect(extractTags('')).toEqual([]);
    });
});
