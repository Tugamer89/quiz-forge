export const getLocalYYYYMMDD = (date = new Date()) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const offset = date.getTimezoneOffset();
    const dateLocal = new Date(date.getTime() - offset * 60 * 1000);
    return dateLocal.toISOString().split('T')[0];
};

export const removeDeckById = (deckId) => (prevDecks) => prevDecks.filter((d) => d.id !== deckId);

export const removeQuestionsByDeckId = (deckId) => (prevQuestions) =>
    prevQuestions.filter((q) => q.deckId !== deckId);

export const setQuestionStatus = (questionId, newStatus) => (prevQuestions) =>
    prevQuestions.map((q) => (q.id === questionId ? { ...q, status: newStatus } : q));

export function mergeQuestions(prevQuestions, parsed, currentDeckId) {
    const existingMap = new Map();
    for (const q of prevQuestions) {
        if (q.deckId === currentDeckId) {
            existingMap.set(q.text, q);
        }
    }

    return parsed.map((newQ) => {
        const existing = existingMap.get(newQ.text);
        if (existing) {
            return { ...newQ, status: existing.status, id: existing.id, deckId: currentDeckId };
        }
        return { ...newQ, deckId: currentDeckId };
    });
}

export function filterQuestions(questions, searchTerm, includedTags, excludedTags) {
    if (!searchTerm && includedTags.length === 0 && excludedTags.length === 0) {
        return questions;
    }

    const searchLower = searchTerm.toLowerCase();
    const includedSet = new Set(includedTags);
    const excludedSet = new Set(excludedTags);

    return questions.filter((q) => {
        if (includedSet.size > 0 && !q.tags?.some((t) => includedSet.has(t))) {
            return false;
        }
        if (excludedSet.size > 0 && q.tags?.some((t) => excludedSet.has(t))) {
            return false;
        }
        if (searchTerm) {
            if (q.text.toLowerCase().includes(searchLower)) return true;
            if (q.answer.toLowerCase().includes(searchLower)) return true;
            return false;
        }
        return true;
    });
}
