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
    return parsed.map((newQ) => {
        const existing = prevQuestions.find(
            (q) => q.text === newQ.text && q.deckId === currentDeckId
        );
        if (existing) {
            return { ...newQ, status: existing.status, id: existing.id, deckId: currentDeckId };
        }
        return { ...newQ, deckId: currentDeckId };
    });
}
