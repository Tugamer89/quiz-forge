import { describe, it, expect } from 'vitest';
import { buildHeatmapData } from './ActivityHeatmap';
import { getLocalYYYYMMDD } from '../../utils/helpers';

describe('buildHeatmapData', () => {
    it('should generate correct layout for a given date and empty deckLog', () => {
        // Jan 1, 2023 was a Sunday. getDay() === 0, which the code maps to 7.
        // emptyDaysAtEnd = 7 - 7 = 0.
        const todayDate = new Date(2023, 0, 1);
        const deckLog = {};
        const columns = 2; // totalCells = 14

        const result = buildHeatmapData(deckLog, todayDate, columns);

        expect(result.total).toBe(0);
        expect(result.todayStr).toBe(getLocalYYYYMMDD(todayDate));

        expect(result.daysArray.length).toBe(14);
        expect(result.daysArray.filter(d => d.isFuture).length).toBe(0);
    });

    it('should calculate counts and total correctly', () => {
        // Jan 4, 2023 was a Wednesday. getDay() === 3.
        // emptyDaysAtEnd = 7 - 3 = 4.
        const todayDate = new Date(2023, 0, 4);

        const d1 = new Date(2023, 0, 4);
        const d2 = new Date(2023, 0, 3);

        const deckLog = {
            [getLocalYYYYMMDD(d1)]: 5,
            [getLocalYYYYMMDD(d2)]: 10,
        };
        const columns = 1; // totalCells = 7

        const result = buildHeatmapData(deckLog, todayDate, columns);

        expect(result.total).toBe(15);

        // daysArray = 3 real days + 4 future days = 7
        expect(result.daysArray.length).toBe(7);

        const futureDays = result.daysArray.filter(d => d.isFuture);
        expect(futureDays.length).toBe(4);

        const todayEntry = result.daysArray.find(d => d.date === getLocalYYYYMMDD(todayDate));
        expect(todayEntry.count).toBe(5);

        const yesterdayEntry = result.daysArray.find(d => d.date === getLocalYYYYMMDD(d2));
        expect(yesterdayEntry.count).toBe(10);
    });

    it('should handle missing dates gracefully', () => {
        // Oct 31, 2023 was a Tuesday (2).
        const todayDate = new Date(2023, 9, 31);
        const deckLog = {
            '2023-10-31': 2,
            '2023-10-30': 4,
            '2023-10-29': 1 // Not in the scope of columns=0 but let's test a small window
        };
        const columns = 1; // totalCells = 7
        const result = buildHeatmapData(deckLog, todayDate, columns);

        expect(result.daysArray.length).toBe(7); // 2 real days + 5 future days = 7
        const futureDays = result.daysArray.filter(d => d.isFuture);
        expect(futureDays.length).toBe(5);
    });
});
