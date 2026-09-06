import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeckOverview } from './DeckOverview';

// Mock SafeMarkdown
vi.mock('../../SafeMarkdown', () => ({
    default: ({ children }) => <div>{children}</div>,
}));
vi.mock('../SafeMarkdown', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('DeckOverview Component', () => {
    const mockOnMarkQuestion = vi.fn();
    const mockOnGenerateQuiz = vi.fn();
    const defaultStats = { total: 0, correct: 0, incorrect: 0, partiallyCorrect: 0, unanswered: 0 };

    const sampleQuestions = [
        {
            id: '1',
            number: 1,
            text: 'Question 1',
            answer: 'Answer 1',
            tags: ['tag1', 'tag2'],
            status: 'unanswered',
        },
        {
            id: '2',
            number: 2,
            text: 'Question 2',
            answer: 'Answer 2',
            tags: ['tag2', 'tag3'],
            status: 'correct',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when there are no questions', () => {
        render(
            <DeckOverview
                questions={[]}
                stats={defaultStats}
                onMarkQuestion={mockOnMarkQuestion}
                onGenerateQuiz={mockOnGenerateQuiz}
            />
        );
        expect(screen.getByText(/This deck is empty/i)).toBeInTheDocument();
        expect(screen.getByText(/Add questions in the raw text box/i)).toBeInTheDocument();
    });

    it('renders a list of questions', () => {
        render(
            <DeckOverview
                questions={sampleQuestions}
                stats={{ ...defaultStats, total: 2 }}
                onMarkQuestion={mockOnMarkQuestion}
                onGenerateQuiz={mockOnGenerateQuiz}
            />
        );

        expect(screen.getByText('Question 1')).toBeInTheDocument();
        expect(screen.getByText('Question 2')).toBeInTheDocument();

        expect(screen.getByText('1.')).toBeInTheDocument();
        expect(screen.getByText('2.')).toBeInTheDocument();
    });

    it('expands and collapses a question to show the answer', () => {
        render(
            <DeckOverview
                questions={sampleQuestions}
                stats={{ ...defaultStats, total: 2 }}
                onMarkQuestion={mockOnMarkQuestion}
                onGenerateQuiz={mockOnGenerateQuiz}
            />
        );

        // Answer should not be visible initially
        expect(screen.queryByText('Answer 1')).not.toBeInTheDocument();

        // Click to expand - The button has `aria-label="Expand question to see answer"` when collapsed
        // and `aria-label="Collapse question"` when expanded.
        const expandButtons = screen.getAllByLabelText('Expand question to see answer');
        fireEvent.click(expandButtons[0]); // Click first question

        expect(screen.getByText('Answer 1')).toBeInTheDocument();

        // Click again to collapse
        const collapseButton = screen.getByLabelText('Collapse question');
        fireEvent.click(collapseButton);

        // Check if Answer 1 is gone
        expect(screen.queryByText('Answer 1')).not.toBeInTheDocument();
    });

    it('calls onMarkQuestion when status buttons are clicked', () => {
        render(
            <DeckOverview
                questions={sampleQuestions}
                stats={{ ...defaultStats, total: 2 }}
                onMarkQuestion={mockOnMarkQuestion}
                onGenerateQuiz={mockOnGenerateQuiz}
            />
        );

        // Find status buttons for the first question
        const markUnansweredBtns = screen.getAllByTitle('Mark as unanswered');
        const markCorrectBtns = screen.getAllByTitle('Mark as correct');
        const markPartiallyCorrectBtns = screen.getAllByTitle('Mark as partially correct');
        const markIncorrectBtns = screen.getAllByTitle('Mark as incorrect');

        // Click correct for Q1
        fireEvent.click(markCorrectBtns[0]);
        expect(mockOnMarkQuestion).toHaveBeenCalledWith('1', 'correct');

        // Click incorrect for Q2
        fireEvent.click(markIncorrectBtns[1]);
        expect(mockOnMarkQuestion).toHaveBeenCalledWith('2', 'incorrect');

        // Click partially-correct for Q1
        fireEvent.click(markPartiallyCorrectBtns[0]);
        expect(mockOnMarkQuestion).toHaveBeenCalledWith('1', 'partially-correct');

        // Click unanswered for Q2
        fireEvent.click(markUnansweredBtns[1]);
        expect(mockOnMarkQuestion).toHaveBeenCalledWith('2', 'unanswered');
    });

    it('calls onGenerateQuiz when "Start Custom Session" is clicked', () => {
        render(
            <DeckOverview
                questions={sampleQuestions}
                stats={{ ...defaultStats, total: 2 }}
                onMarkQuestion={mockOnMarkQuestion}
                onGenerateQuiz={mockOnGenerateQuiz}
            />
        );

        // Must click a tag filter to show "Start Custom Session" button
        const tagButton = screen.getByLabelText('Filter by tag tag1');
        fireEvent.click(tagButton);

        const startSessionButton = screen.getByText('Start Custom Session');
        fireEvent.click(startSessionButton);

        expect(mockOnGenerateQuiz).toHaveBeenCalledWith({
            includedTags: ['tag1'],
            excludedTags: [],
        });
    });
});
