import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityHeatmap, buildHeatmapData } from './ActivityHeatmap';
import { getLocalYYYYMMDD } from '../../utils/helpers';

describe('buildHeatmapData', () => {
    it('should generate correct layout for a given date and empty deckLog', () => {
        const todayDate = new Date(2023, 0, 1);
        const result = buildHeatmapData({}, todayDate, 2);

        expect(result.total).toBe(0);
        expect(result.todayStr).toBe(getLocalYYYYMMDD(todayDate));
        expect(result.daysArray.length).toBe(14);
        expect(result.daysArray.filter(d => d.isFuture).length).toBe(0);
    });

    it('should calculate counts and total correctly', () => {
        const todayDate = new Date(2023, 0, 4);
        const d2 = new Date(2023, 0, 3);
        const deckLog = {
            [getLocalYYYYMMDD(todayDate)]: 5,
            [getLocalYYYYMMDD(d2)]: 10,
        };

        const result = buildHeatmapData(deckLog, todayDate, 1);

        expect(result.total).toBe(15);
        expect(result.daysArray.length).toBe(7);
        expect(result.daysArray.filter(d => d.isFuture).length).toBe(4);
    });

    it('should handle missing dates gracefully', () => {
        const todayDate = new Date(2023, 9, 31);
        const deckLog = { '2023-10-31': 2, '2023-10-30': 4 };
        const result = buildHeatmapData(deckLog, todayDate, 1);

        expect(result.daysArray.length).toBe(7);
        expect(result.daysArray.filter(d => d.isFuture).length).toBe(5);
    });
});

describe('ActivityHeatmap Component', () => {
    it('renders empty state correctly', () => {
        render(<ActivityHeatmap deckLog={{}} />);
        expect(screen.getByText('Deck Activity')).toBeInTheDocument();
        expect(screen.getByText('0 reviews')).toBeInTheDocument();
    });

    it('renders streak and activity totals in the DOM', () => {
        const today = new Date();
        const deckLog = { [getLocalYYYYMMDD(today)]: 5 };

        render(<ActivityHeatmap deckLog={deckLog} />);
        expect(screen.getByText('5 reviews')).toBeInTheDocument();
    });
});