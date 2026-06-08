export const getLocalYYYYMMDD = (date = new Date()) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

    // Performance optimization: Avoid creating an extra Date object and calling toISOString()
    // which has a significant overhead. Instead, format the existing Date object directly.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    let searchRegex = null;
    if (searchTerm) {
        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
        searchRegex = new RegExp(escapedSearch, 'i');
    }

    const includedSet = new Set(includedTags);
    const excludedSet = new Set(excludedTags);

    return questions.filter((q) => {
        if (includedSet.size > 0 && !q.tags?.some((t) => includedSet.has(t))) {
            return false;
        }
        if (excludedSet.size > 0 && q.tags?.some((t) => excludedSet.has(t))) {
            return false;
        }
        if (searchRegex) {
            return searchRegex.test(q.text) || searchRegex.test(q.answer);
        }
        return true;
    });
}
