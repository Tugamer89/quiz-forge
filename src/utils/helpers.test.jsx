import { describe, it, expect } from 'vitest';
import { mergeQuestions, filterQuestions } from './helpers';

describe('mergeQuestions', () => {
    it('should add new questions with currentDeckId when prevQuestions is empty', () => {
        const prevQuestions = [];
        const parsed = [
            { text: 'What is 2+2?', answer: '4' },
            { text: 'What is the capital of France?', answer: 'Paris' },
        ];
        const currentDeckId = 'deck-1';

        const result = mergeQuestions(prevQuestions, parsed, currentDeckId);

        expect(result).toHaveLength(2);
        expect(result).toEqual([
            { text: 'What is 2+2?', answer: '4', deckId: 'deck-1' },
            { text: 'What is the capital of France?', answer: 'Paris', deckId: 'deck-1' },
        ]);
    });

    it('should correctly deduplicate matching questions and preserve existing id and status', () => {
        const prevQuestions = [
            { id: 'q1', text: 'What is 2+2?', answer: '4', status: 'learned', deckId: 'deck-1' },
            {
                id: 'q2',
                text: 'Unrelated question',
                answer: 'Yes',
                status: 'new',
                deckId: 'deck-1',
            },
        ];
        const parsed = [
            { text: 'What is 2+2?', answer: 'four' }, // text matches q1
            { text: 'What is the capital of France?', answer: 'Paris' }, // completely new
        ];
        const currentDeckId = 'deck-1';

        const result = mergeQuestions(prevQuestions, parsed, currentDeckId);

        expect(result).toHaveLength(2);
        expect(result).toEqual([
            { id: 'q1', text: 'What is 2+2?', answer: 'four', status: 'learned', deckId: 'deck-1' },
            { text: 'What is the capital of France?', answer: 'Paris', deckId: 'deck-1' },
        ]);
    });

    it('should ignore questions from other decks when deduplicating', () => {
        const prevQuestions = [
            { id: 'q1', text: 'What is 2+2?', answer: '4', status: 'learned', deckId: 'deck-2' }, // Different deckId
        ];
        const parsed = [{ text: 'What is 2+2?', answer: 'four' }];
        const currentDeckId = 'deck-1';

        const result = mergeQuestions(prevQuestions, parsed, currentDeckId);

        expect(result).toHaveLength(1);
        expect(result).toEqual([
            { text: 'What is 2+2?', answer: 'four', deckId: 'deck-1' }, // Should not merge with q1 from deck-2
        ]);
    });
});

describe('filterQuestions', () => {
    const questions = [
        { id: '1', text: 'What is React?', answer: 'A UI library', tags: ['frontend', 'js'] },
        { id: '2', text: 'What is Node.js?', answer: 'A JS runtime', tags: ['backend', 'js'] },
        { id: '3', text: 'What is Python?', answer: 'A language', tags: ['backend'] },
    ];

    it('should return all questions when no filters are applied', () => {
        expect(filterQuestions(questions, '', [], [])).toEqual(questions);
    });

    it('should filter by search term matching text', () => {
        const result = filterQuestions(questions, 'react', [], []);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter by search term matching answer', () => {
        const result = filterQuestions(questions, 'runtime', [], []);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should filter by included tags', () => {
        const result = filterQuestions(questions, '', ['frontend'], []);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should filter by excluded tags', () => {
        const result = filterQuestions(questions, '', [], ['backend']);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('should apply search, included, and excluded filters together', () => {
        const result = filterQuestions(questions, 'js', ['js'], ['frontend']);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });
});
