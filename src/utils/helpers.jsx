export const removeDeckById = (deckId) => (prevDecks) => prevDecks.filter((d) => d.id !== deckId);

export const removeQuestionsByDeckId = (deckId) => (prevQuestions) =>
  prevQuestions.filter((q) => q.deckId !== deckId);

export const setQuestionStatus = (questionId, newStatus) => (prevQuestions) =>
  prevQuestions.map((q) => (q.id === questionId ? { ...q, status: newStatus } : q));

export function mergeQuestions(prevQuestions, parsed, currentDeckId) {
  return parsed.map((newQ) => {
    const existing = prevQuestions.find((q) => q.text === newQ.text && q.deckId === currentDeckId);
    if (existing) {
      return { ...newQ, status: existing.status, id: existing.id, deckId: currentDeckId };
    }
    return { ...newQ, deckId: currentDeckId };
  });
}

// Simple Markdown Parser (Bold, Italic, Inline Code)
export const formatMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={`line-${i}-${line.substring(0, 5)}`} className="block min-h-6">
        {parts.map((part, j) => {
          const partKey = `part-${j}-${part.substring(0, 10)}`;
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code
                key={partKey}
                className="bg-slate-200 dark:bg-slate-700 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md font-mono text-sm"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partKey} className="font-bold text-indigo-700 dark:text-indigo-400">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={partKey} className="italic text-slate-700 dark:text-slate-300">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <span key={partKey}>{part}</span>;
        })}
      </span>
    );
  });
};
