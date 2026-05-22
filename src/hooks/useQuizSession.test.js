import { renderHook, act } from '@testing-library/react';
import { useQuizSession } from './useQuizSession';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
    addBreadcrumb: vi.fn(),
}));

describe('useQuizSession', () => {
    const mockQuestions = [
        {
            id: '1',
            deckId: 'deck1',
            tags: ['react', 'frontend'],
            status: 'unanswered',
            nextReviewDate: null,
        },
        {
            id: '2',
            deckId: 'deck1',
            tags: ['css', 'frontend'],
            status: 'unanswered',
            nextReviewDate: null,
        },
        {
            id: '3',
            deckId: 'deck1',
            tags: ['backend', 'node'],
            status: 'unanswered',
            nextReviewDate: null,
        },
        { id: '4', deckId: 'deck2', tags: ['react'], status: 'unanswered', nextReviewDate: null },
    ];

    const mockSettings = {
        numToGenerate: 5,
        includeUnanswered: true,
        includeCorrect: true,
        includeIncorrect: true,
        includePartiallyCorrect: true,
        srsEnabled: false,
    };

    const mockSetQuestions = vi.fn();
    const mockShowToast = vi.fn();
    const mockLogActivity = vi.fn();

    it('should generate a quiz without filters', () => {
        const { result } = renderHook(() =>
            useQuizSession(
                mockQuestions,
                mockSetQuestions,
                mockSettings,
                'deck1',
                mockShowToast,
                mockLogActivity
            )
        );

        act(() => {
            result.current.generateQuiz();
        });

        expect(result.current.quizSession.questions).toHaveLength(3);
    });

    it('should generate a quiz with includedTags filter', () => {
        const { result } = renderHook(() =>
            useQuizSession(
                mockQuestions,
                mockSetQuestions,
                mockSettings,
                'deck1',
                mockShowToast,
                mockLogActivity
            )
        );

        act(() => {
            result.current.generateQuiz({ includedTags: ['react'] });
        });

        expect(result.current.quizSession.questions).toHaveLength(1);
        expect(result.current.quizSession.questions[0].id).toBe('1');
    });

    it('should generate a quiz with excludedTags filter', () => {
        const { result } = renderHook(() =>
            useQuizSession(
                mockQuestions,
                mockSetQuestions,
                mockSettings,
                'deck1',
                mockShowToast,
                mockLogActivity
            )
        );

        act(() => {
            result.current.generateQuiz({ excludedTags: ['react'] });
        });

        expect(result.current.quizSession.questions).toHaveLength(2);
        expect(result.current.quizSession.questions.map((q) => q.id)).toEqual(
            expect.arrayContaining(['2', '3'])
        );
    });

    it('should generate a quiz with both includedTags and excludedTags filters', () => {
        const { result } = renderHook(() =>
            useQuizSession(
                mockQuestions,
                mockSetQuestions,
                mockSettings,
                'deck1',
                mockShowToast,
                mockLogActivity
            )
        );

        act(() => {
            result.current.generateQuiz({ includedTags: ['frontend'], excludedTags: ['react'] });
        });

        expect(result.current.quizSession.questions).toHaveLength(1);
        expect(result.current.quizSession.questions[0].id).toBe('2');
    });

    it('should call showToast if no questions match filters', () => {
        const { result } = renderHook(() =>
            useQuizSession(
                mockQuestions,
                mockSetQuestions,
                mockSettings,
                'deck1',
                mockShowToast,
                mockLogActivity
            )
        );

        act(() => {
            result.current.generateQuiz({ includedTags: ['nonexistent'] });
        });

        expect(result.current.quizSession.questions).toHaveLength(0);
        expect(mockShowToast).toHaveBeenCalledWith('No questions match filters!', 'info');
    });
});
