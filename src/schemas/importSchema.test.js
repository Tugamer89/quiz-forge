import { describe, it, expect } from 'vitest';
import { deckSchema, questionSchema, importSchema } from './importSchema.js';

describe('deckSchema', () => {
    it('should validate a valid deck', () => {
        const validDeck = { id: 'deck-1', name: 'My Deck' };
        expect(() => deckSchema.parse(validDeck)).not.toThrow();
    });

    it('should fail if required fields are missing', () => {
        const invalidDeck = { id: 'deck-1' }; // missing name
        const result = deckSchema.safeParse(invalidDeck);
        expect(result.success).toBe(false);
    });
});

describe('questionSchema', () => {
    it('should validate a valid minimal question and apply defaults', () => {
        const validQuestion = {
            id: 'q-1',
            text: 'Question text',
            answer: 'Answer text',
            deckId: 'deck-1',
        };
        const parsed = questionSchema.parse(validQuestion);
        expect(parsed.status).toBe('unanswered');
        expect(parsed.tags).toEqual([]);
    });

    it('should validate a fully populated question', () => {
        const fullQuestion = {
            id: 'q-1',
            number: '1',
            text: 'Question text',
            answer: 'Answer text',
            status: 'correct',
            deckId: 'deck-1',
            tags: ['tag1', 'tag2'],
            easeFactor: 2.5,
            interval: 1,
            repetition: 0,
            nextReviewDate: '2023-01-01',
        };
        expect(() => questionSchema.parse(fullQuestion)).not.toThrow();
    });

    it('should fail if invalid status is provided', () => {
        const invalidQuestion = {
            id: 'q-1',
            text: 'Question text',
            answer: 'Answer text',
            deckId: 'deck-1',
            status: 'invalid-status',
        };
        const result = questionSchema.safeParse(invalidQuestion);
        expect(result.success).toBe(false);
    });
});

describe('importSchema', () => {
    it('should validate a valid import object', () => {
        const validImport = {
            decks: [{ id: 'deck-1', name: 'Deck 1' }],
            questions: [
                {
                    id: 'q-1',
                    text: 'Q1',
                    answer: 'A1',
                    deckId: 'deck-1',
                },
            ],
            rawTexts: { 'deck-1': 'some raw text' },
        };
        expect(() => importSchema.parse(validImport)).not.toThrow();
    });

    it('should fail if decks or questions are missing', () => {
        const invalidImport = {
            decks: [{ id: 'deck-1', name: 'Deck 1' }],
        }; // missing questions
        const result = importSchema.safeParse(invalidImport);
        expect(result.success).toBe(false);
    });

    it('should fail if nested schema validation fails', () => {
        const invalidImport = {
            decks: [{ id: 'deck-1' }], // missing deck name
            questions: [],
        };
        const result = importSchema.safeParse(invalidImport);
        expect(result.success).toBe(false);
    });
});
