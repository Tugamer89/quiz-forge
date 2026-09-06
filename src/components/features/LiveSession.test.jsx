import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveSession } from './LiveSession';

// Mock child components to isolate testing of LiveSession
vi.mock('../ProgressBar', () => ({
    ProgressBar: ({ current, total }) => (
        <div data-testid="progress-bar">
            {current}/{total}
        </div>
    ),
}));

vi.mock('../SafeMarkdown', () => ({
    default: ({ children }) => <div data-testid="safe-markdown">{children}</div>,
}));

vi.mock('../../hooks/useShortcuts', () => ({
    useShortcuts: vi.fn(({ onFlip, onGradeWrong, onGradePartial, onGradeCorrect, onExit }) => {
        // Expose the mock callbacks to the global window object for easy testing
        window.__mockShortcuts = {
            onFlip,
            onGradeWrong,
            onGradePartial,
            onGradeCorrect,
            onExit,
        };
    }),
}));

const mockSession = {
    questions: [
        { id: 1, text: 'Question 1', answer: 'Answer 1' },
        { id: 2, text: 'Question 2', answer: 'Answer 2' },
    ],
    currentIndex: 0,
};

describe('LiveSession Component', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = {
            session: mockSession,
            onCancel: vi.fn(),
            showAnswer: false,
            onReveal: vi.fn(),
            onAnswer: vi.fn(),
        };
        // Reset scrolling mock
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        delete window.__mockShortcuts;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders the current question', () => {
        render(<LiveSession {...defaultProps} />);

        expect(screen.getByText('Live Session')).toBeInTheDocument();
        const safeMarkdowns = screen.getAllByTestId('safe-markdown');
        expect(safeMarkdowns[0]).toHaveTextContent('Question 1');
    });

    it('shows progress correctly', () => {
        render(<LiveSession {...defaultProps} />);
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('1/2');
    });

    it('scrolls to top on mount', () => {
        render(<LiveSession {...defaultProps} />);
        expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
        act(() => {
            vi.advanceTimersByTime(50);
        });
        expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
            behavior: 'smooth',
            block: 'start',
        });
    });

    it('handles typing in the answer textarea', () => {
        render(<LiveSession {...defaultProps} />);

        const textarea = screen.getByRole('textbox', { name: /your answer/i });
        fireEvent.change(textarea, { target: { value: 'My attempted answer' } });

        expect(textarea).toHaveValue('My attempted answer');
    });

    it('calls onReveal when reveal button is clicked', () => {
        render(<LiveSession {...defaultProps} />);

        const revealBtn = screen.getByRole('button', { name: /reveal answer/i });
        fireEvent.click(revealBtn);

        expect(defaultProps.onReveal).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<LiveSession {...defaultProps} />);

        const cancelBtn = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelBtn);

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    describe('when answer is revealed (showAnswer = true)', () => {
        beforeEach(() => {
            defaultProps.showAnswer = true;
        });

        it('displays the correct answer', () => {
            render(<LiveSession {...defaultProps} />);

            const safeMarkdowns = screen.getAllByTestId('safe-markdown');
            // Question text should be first
            expect(safeMarkdowns[0]).toHaveTextContent('Question 1');
            // Correct answer should be visible
            const correctAnswerTitle = screen.getByText('Correct Answer');
            expect(correctAnswerTitle).toBeInTheDocument();
            // Since it's second in DOM
            expect(safeMarkdowns[safeMarkdowns.length - 1]).toHaveTextContent('Answer 1');
        });

        it('displays user answer if typed before reveal', () => {
            const Wrapper = () => {
                const [showAnswer, setShowAnswer] = React.useState(false);
                return (
                    <LiveSession
                        {...defaultProps}
                        showAnswer={showAnswer}
                        onReveal={() => setShowAnswer(true)}
                    />
                );
            };

            render(<Wrapper />);

            const textarea = screen.getByRole('textbox', { name: /your answer/i });
            fireEvent.change(textarea, { target: { value: 'User temp answer' } });

            const revealBtn = screen.getByRole('button', { name: /reveal answer/i });
            fireEvent.click(revealBtn);

            expect(screen.getByText('Your Answer')).toBeInTheDocument();

            const safeMarkdowns = screen.getAllByTestId('safe-markdown');
            // Question text is index 0
            // User answer is index 1
            expect(safeMarkdowns[1]).toHaveTextContent('User temp answer');
        });

        it('calls onAnswer with correct grade when grading buttons are clicked', () => {
            render(<LiveSession {...defaultProps} />);

            const incorrectBtn = screen.getByRole('button', { name: /incorrect/i });
            const partialBtn = screen.getByRole('button', { name: /partial/i });
            const correctBtn = screen.getByRole('button', { name: /^correct \(\d\)$/i });

            fireEvent.click(incorrectBtn);
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('incorrect');

            fireEvent.click(partialBtn);
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('partially-correct');

            fireEvent.click(correctBtn);
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('correct');

            expect(defaultProps.onAnswer).toHaveBeenCalledTimes(3);
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('calls onReveal (onFlip) when Space/Enter is pressed and answer is hidden', () => {
            render(<LiveSession {...defaultProps} showAnswer={false} />);

            act(() => {
                window.__mockShortcuts.onFlip();
            });

            // Fast-forward through the handleActionWithFeedback timeout
            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(defaultProps.onReveal).toHaveBeenCalledTimes(1);
        });

        it('does not call onReveal when answer is already shown', () => {
            render(<LiveSession {...defaultProps} showAnswer={true} />);

            act(() => {
                window.__mockShortcuts.onFlip();
            });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(defaultProps.onReveal).not.toHaveBeenCalled();
        });

        it('handles grading shortcuts when answer is shown', () => {
            render(<LiveSession {...defaultProps} showAnswer={true} />);

            act(() => {
                window.__mockShortcuts.onGradeWrong();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('incorrect');

            act(() => {
                window.__mockShortcuts.onGradePartial();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('partially-correct');

            act(() => {
                window.__mockShortcuts.onGradeCorrect();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).toHaveBeenLastCalledWith('correct');
        });

        it('does not handle grading shortcuts when answer is hidden', () => {
            render(<LiveSession {...defaultProps} showAnswer={false} />);

            act(() => {
                window.__mockShortcuts.onGradeWrong();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).not.toHaveBeenCalled();

            act(() => {
                window.__mockShortcuts.onGradePartial();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).not.toHaveBeenCalled();

            act(() => {
                window.__mockShortcuts.onGradeCorrect();
            });
            act(() => {
                vi.advanceTimersByTime(250);
            });
            expect(defaultProps.onAnswer).not.toHaveBeenCalled();
        });

        it('handles onExit shortcut', () => {
            render(<LiveSession {...defaultProps} />);

            act(() => {
                window.__mockShortcuts.onExit();
            });

            act(() => {
                vi.advanceTimersByTime(250);
            });

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });
    });
});
