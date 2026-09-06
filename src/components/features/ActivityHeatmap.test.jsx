import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActivityHeatmap } from './ActivityHeatmap';

describe('ActivityHeatmap', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders correctly with empty deckLog', () => {
        render(<ActivityHeatmap deckLog={{}} />);
        expect(screen.getByText('Deck Activity')).toBeInTheDocument();
        expect(screen.getByText('0 reviews')).toBeInTheDocument();
    });

    it('calculates streaks and total cards correctly', () => {
        const today = new Date('2023-10-15T12:00:00Z');
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - offset * 60 * 1000);

        const todayStr = localDate.toISOString().split('T')[0];

        const yesterday = new Date(localDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const twoDaysAgo = new Date(localDate);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const deckLog = {
            [todayStr]: 5,
            [yesterdayStr]: 10,
            [twoDaysAgoStr]: 2,
        };

        render(<ActivityHeatmap deckLog={deckLog} />);

        expect(screen.getByText('17 reviews')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles gap in streak correctly', () => {
        const today = new Date('2023-10-15T12:00:00Z');
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - offset * 60 * 1000);

        const todayStr = localDate.toISOString().split('T')[0];

        const twoDaysAgo = new Date(localDate);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

        const deckLog = {
            [todayStr]: 5,
            [twoDaysAgoStr]: 2,
        };

        render(<ActivityHeatmap deckLog={deckLog} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('7 reviews')).toBeInTheDocument();
    });

    it('handles missing today but existing yesterday correctly for streak calculation', () => {
        const today = new Date('2023-10-15T12:00:00Z');
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - offset * 60 * 1000);

        const yesterday = new Date(localDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const deckLog = {
            [yesterdayStr]: 10,
        };

        render(<ActivityHeatmap deckLog={deckLog} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('10 reviews')).toBeInTheDocument();
    });

    it('applies the correct colors for different counts', () => {
        const today = new Date('2023-10-15T12:00:00Z');
        const offset = today.getTimezoneOffset();
        const localDate = new Date(today.getTime() - offset * 60 * 1000);

        const deckLog = {};
        const counts = [0, 2, 10, 25, 40];

        counts.forEach((count, i) => {
            const d = new Date(localDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            deckLog[dateStr] = count;
        });

        render(<ActivityHeatmap deckLog={deckLog} />);

        const cellsWith2Reviews = screen.getAllByTitle(/2 reviews on /);
        expect(cellsWith2Reviews[0]).toHaveClass('bg-indigo-200');

        const cellsWith10Reviews = screen.getAllByTitle(/10 reviews on /);
        expect(cellsWith10Reviews[0]).toHaveClass('bg-indigo-400');

        const cellsWith25Reviews = screen.getAllByTitle(/25 reviews on /);
        expect(cellsWith25Reviews[0]).toHaveClass('bg-indigo-500');

        const cellsWith40Reviews = screen.getAllByTitle(/40 reviews on /);
        expect(cellsWith40Reviews[0]).toHaveClass('bg-indigo-600');
    });
});
