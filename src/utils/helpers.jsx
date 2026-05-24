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
    // perf: Replace O(n²) nested loop with O(n) hash map lookup for merging questions
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
