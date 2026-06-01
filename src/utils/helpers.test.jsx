import { describe, it, expect } from 'vitest';
import { mergeQuestions } from './helpers';

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
