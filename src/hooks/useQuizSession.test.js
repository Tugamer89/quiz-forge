import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useQuizSession } from './useQuizSession';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react', () => ({
    addBreadcrumb: vi.fn(),
}));

describe('useQuizSession Hook', () => {
    let mockActiveDeckQuestions;
    let mockSetQuestions;
    let mockSettings;
    let mockSelectedDeckId;
    let mockShowToast;
    let mockLogActivity;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
        vi.clearAllMocks();

        mockActiveDeckQuestions = [
            { id: 1, status: 'unanswered', tags: ['easy'] },
            { id: 2, status: 'correct', tags: ['medium'] },
            { id: 3, status: 'incorrect', tags: ['hard'] },
            { id: 4, status: 'partially-correct', tags: ['easy', 'medium'] },
            { id: 5, status: 'unanswered', tags: ['hard'], nextReviewDate: '2022-12-31T12:00:00Z', interval: 1, easeFactor: 2.5, repetition: 1 },
            { id: 6, status: 'unanswered', tags: ['easy'], nextReviewDate: '2023-01-02T12:00:00Z', interval: 2, easeFactor: 2.5, repetition: 2 },
        ];

        mockSetQuestions = vi.fn();
        mockSettings = {
            srsEnabled: false,
            includeUnanswered: true,
            includeCorrect: true,
            includeIncorrect: true,
            includePartiallyCorrect: true,
            numToGenerate: 10,
        };
        mockSelectedDeckId = 'deck-1';
        mockShowToast = vi.fn();
        mockLogActivity = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderHookWithArgs = () => renderHook(() => useQuizSession(
        mockActiveDeckQuestions,
        mockSetQuestions,
        mockSettings,
        mockSelectedDeckId,
        mockShowToast,
        mockLogActivity
    ));

    const setupSRSQuizSession = () => {
        mockSettings.srsEnabled = true;
        mockActiveDeckQuestions = [{ id: 5, status: 'unanswered', nextReviewDate: '2022-12-31T12:00:00Z', interval: 1, easeFactor: 2.5, repetition: 1 }];
        const { result } = renderHookWithArgs();
        act(() => {
            result.current.generateQuiz();
        });
        return result;
    };

    it('initializes with default state', () => {
        const { result } = renderHookWithArgs();

        expect(result.current.quizSession).toEqual({
            active: false,
            isFinished: false,
            questions: [],
            currentIndex: 0,
            correctCount: 0,
            incorrectCount: 0,
            partiallyCorrectCount: 0,
            lastOptions: {},
        });
        expect(result.current.showAnswer).toBe(false);
    });

    it('generates a quiz based on settings without SRS', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });

        expect(result.current.quizSession.active).toBe(true);
        expect(result.current.quizSession.questions.length).toBe(6);
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({ category: 'quiz_generation' }));
    });

    it('filters questions by includedTags', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz({ includedTags: ['easy'] });
        });

        expect(result.current.quizSession.questions.length).toBe(3); // ids 1, 4, 6
    });

    it('filters questions by excludedTags', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz({ excludedTags: ['easy'] });
        });

        expect(result.current.quizSession.questions.length).toBe(3); // ids 2, 3, 5
    });

    it('shows toast when no eligible questions', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz({ includedTags: ['non-existent'] });
        });

        expect(mockShowToast).toHaveBeenCalledWith('No questions match filters!', 'info');
        expect(result.current.quizSession.active).toBe(false);
    });

    it('filters questions by SRS date when srsEnabled is true', () => {
        mockSettings.srsEnabled = true;
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });

        // expected ids: 1, 2, 3, 4 (no review date) and 5 (past review date). 6 is in future.
        expect(result.current.quizSession.questions.length).toBe(5);
        expect(result.current.quizSession.questions.find(q => q.id === 6)).toBeUndefined();
    });

    it('shows toast for SRS when no eligible questions', () => {
        mockSettings.srsEnabled = true;
        mockActiveDeckQuestions = [
            { id: 6, status: 'unanswered', tags: ['easy'], nextReviewDate: '2023-01-02T12:00:00Z', interval: 2, easeFactor: 2.5, repetition: 2 }
        ];
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });

        expect(mockShowToast).toHaveBeenCalledWith('You are all caught up for today! No reviews pending.', 'info');
    });

    it('limits the number of questions generated', () => {
        mockSettings.numToGenerate = 2;
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });

        expect(result.current.quizSession.questions.length).toBe(2);
    });

    it('handles correct answer and updates state/SRS properties correctly', () => {
        const result = setupSRSQuizSession();

        act(() => {
            result.current.handleAnswer('correct');
        });

        expect(mockSetQuestions).toHaveBeenCalled();
        const stateUpdateFn = mockSetQuestions.mock.calls[0][0];
        const nextQuestions = stateUpdateFn(mockActiveDeckQuestions);

        expect(nextQuestions[0]).toMatchObject({
            status: 'correct',
            interval: 6,
            repetition: 2,
            nextReviewDate: expect.any(String),
        });

        expect(mockLogActivity).toHaveBeenCalledWith('deck-1', 1);
        expect(result.current.quizSession.correctCount).toBe(1);
        expect(result.current.quizSession.currentIndex).toBe(1);
        expect(result.current.quizSession.isFinished).toBe(true);
        expect(result.current.quizSession.active).toBe(false);
    });

    it('handles incorrect answer and updates state/SRS properties correctly', () => {
        const result = setupSRSQuizSession();

        act(() => {
            result.current.handleAnswer('incorrect');
        });

        const stateUpdateFn = mockSetQuestions.mock.calls[0][0];
        const nextQuestions = stateUpdateFn(mockActiveDeckQuestions);

        expect(nextQuestions[0]).toMatchObject({
            status: 'incorrect',
            interval: 1,
            repetition: 0,
        });
        expect(result.current.quizSession.incorrectCount).toBe(1);
    });

    it('handles partially-correct answer like incorrect for SRS', () => {
        const result = setupSRSQuizSession();

        act(() => {
            result.current.handleAnswer('partially-correct');
        });

        const stateUpdateFn = mockSetQuestions.mock.calls[0][0];
        const nextQuestions = stateUpdateFn(mockActiveDeckQuestions);

        expect(nextQuestions[0]).toMatchObject({
            status: 'partially-correct',
            interval: 1,
            repetition: 0,
        });
        expect(result.current.quizSession.partiallyCorrectCount).toBe(1);
    });

    it('handles session cancellation', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });
        expect(result.current.quizSession.active).toBe(true);

        act(() => {
            result.current.cancelSession();
        });
        expect(result.current.quizSession.active).toBe(false);
    });

    it('handles session reset', () => {
        mockSettings.numToGenerate = 1;
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.generateQuiz();
        });

        act(() => {
            result.current.handleAnswer('correct');
        });

        act(() => {
            result.current.resetSession();
        });

        expect(result.current.quizSession.active).toBe(false);
        expect(result.current.quizSession.isFinished).toBe(false);
    });

    it('handles reveal answer', () => {
        const { result } = renderHookWithArgs();

        act(() => {
            result.current.revealAnswer();
        });

        expect(result.current.showAnswer).toBe(true);
    });
});
