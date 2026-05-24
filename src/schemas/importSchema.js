import { z } from 'zod';

export const deckSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const questionSchema = z
    .object({
        id: z.string(),
        number: z.string().optional().nullable(),
        text: z.string(),
        answer: z.string(),
        status: z
            .enum(['unanswered', 'correct', 'incorrect', 'partially-correct'])
            .catch('unanswered'),
        deckId: z.string(),
        tags: z.array(z.string()).default([]),
        easeFactor: z.number().optional().nullable(),
        interval: z.number().optional().nullable(),
        repetition: z.number().optional().nullable(),
        nextReviewDate: z.string().optional().nullable(),
    })
    .passthrough();

// Prefer top-level await over using a promise chain.
export const importSchema = z.object({
    decks: z.array(deckSchema),
    questions: z.array(questionSchema),
    rawTexts: z.record(z.string()).optional(),
});
