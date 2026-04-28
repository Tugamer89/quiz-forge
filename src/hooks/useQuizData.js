import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  removeDeckById,
  removeQuestionsByDeckId,
  mergeQuestions,
  setQuestionStatus,
} from '../utils/helpers';

export function useQuizData(showToast, setDialog) {
  const [decks, setDecks] = useLocalStorage('quiz_decks', [
    { id: 'default', name: 'General Knowledge' },
  ]);
  const [selectedDeckId, setSelectedDeckId] = useLocalStorage('quiz_selected_deck', 'default');
  const [questions, setQuestions] = useLocalStorage('quiz_questions', []);
  const [rawTexts, setRawTexts] = useLocalStorage('quiz_rawTexts', { default: '' });
  const [settings, setSettings] = useLocalStorage('quiz_settings', {
    numToGenerate: 5,
    includeUnanswered: true,
    includeCorrect: false,
    includeIncorrect: true,
    srsEnabled: false,
  });

  const [isTyping, setIsTyping] = useState(false);
  const currentRawText = rawTexts[selectedDeckId] || '';

  const activeDeckQuestions = useMemo(
    () => questions.filter((q) => q.deckId === selectedDeckId),
    [questions, selectedDeckId]
  );

  const stats = useMemo(
    () => ({
      total: activeDeckQuestions.length,
      unanswered: activeDeckQuestions.filter((q) => q.status === 'unanswered').length,
      correct: activeDeckQuestions.filter((q) => q.status === 'correct').length,
      incorrect: activeDeckQuestions.filter((q) => q.status === 'incorrect').length,
    }),
    [activeDeckQuestions]
  );

  const handleRawTextChange = (val) => {
    setRawTexts((prev) => ({ ...prev, [selectedDeckId]: val }));
    setIsTyping(true);
  };

  const extractTags = (text) => {
    if (!text) return [];

    const textWithoutCode = text.replaceAll(/```[\s\S]*?```/g, '').replaceAll(/`[^`]*`/g, '');
    const matches = textWithoutCode.match(/#\w+/g);
    return matches ? [...new Set(matches.map((t) => t.toLowerCase()))] : [];
  };

  const parseTextFromInput = useCallback(
    (text, deckId) => {
      const lines = text.split('\n');
      const parsed = [];
      let currentQ = null;
      const regex = /^(\d+)[.)]\s+(.+)$/;

      lines.forEach((line) => {
        const match = line.match(regex);
        if (match) {
          if (currentQ) {
            currentQ.tags = [...new Set([...currentQ.tags, ...extractTags(currentQ.answer)])];
            parsed.push(currentQ);
          }
          currentQ = {
            id: crypto.randomUUID(),
            number: match[1],
            text: match[2].trim(),
            answer: '',
            status: 'unanswered',
            deckId,
            tags: extractTags(match[2].trim()),
            // Propreties for Spaced Repetition (SRS)
            easeFactor: 2.5,
            interval: 0,
            repetition: 0,
            nextReviewDate: null,
          };
        } else if (currentQ && (currentQ.answer || line.trim())) {
          currentQ.answer += (currentQ.answer ? '\n' : '') + line;
        }
      });
      if (currentQ) {
        currentQ.tags = [...new Set([...currentQ.tags, ...extractTags(currentQ.answer)])];
        parsed.push(currentQ);
      }

      setQuestions((prev) => {
        const otherDecks = prev.filter((q) => q.deckId !== deckId);
        const merged = mergeQuestions(
          prev.filter((q) => q.deckId === deckId),
          parsed,
          deckId
        );
        return [...otherDecks, ...merged];
      });
    },
    [setQuestions]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseTextFromInput(currentRawText, selectedDeckId);
      setIsTyping(false);
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [currentRawText, selectedDeckId, parseTextFromInput]);

  const handleCopyText = async () => {
    if (!currentRawText) return;
    try {
      await navigator.clipboard.writeText(currentRawText);
      showToast('Text copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy text:', err);
      showToast('Failed to copy text.', 'error');
    }
  };

  const handleClearTextClick = () => {
    setDialog({
      isOpen: true,
      type: 'confirm',
      title: 'Clear Text',
      message:
        'Are you sure you want to clear the raw text? This will also remove the associated questions from the database for this deck.',
      confirmLabel: 'Clear',
      confirmStyle: 'danger',
      onConfirm: () => {
        handleRawTextChange('');
        setQuestions(removeQuestionsByDeckId(selectedDeckId));
        showToast('Text cleared.', 'info');
      },
    });
  };

  const handleAddDeckClick = () => {
    setDialog({
      isOpen: true,
      type: 'prompt',
      title: 'New Deck',
      message: 'Enter a name for your new deck:',
      defaultValue: '',
      confirmLabel: 'Create',
      confirmStyle: 'primary',
      onConfirm: (name) => {
        if (name?.trim()) {
          const newDeck = { id: crypto.randomUUID(), name: name.trim() };
          setDecks((prev) => [...prev, newDeck]);
          setSelectedDeckId(newDeck.id);
          showToast(`Deck "${newDeck.name}" created!`, 'success');
        }
      },
    });
  };

  const handleDeleteDeckClick = () => {
    if (decks.length <= 1) {
      showToast('You cannot delete the last deck.', 'error');
      return;
    }
    setDialog({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Deck',
      message: `Are you sure you want to delete "${decks.find((d) => d.id === selectedDeckId)?.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmStyle: 'danger',
      onConfirm: () => {
        setDecks(removeDeckById(selectedDeckId));
        setQuestions(removeQuestionsByDeckId(selectedDeckId));

        const newRawTexts = { ...rawTexts };
        delete newRawTexts[selectedDeckId];
        setRawTexts(newRawTexts);

        setSelectedDeckId(decks.find((d) => d.id !== selectedDeckId).id);
        showToast('Deck deleted.', 'info');
      },
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data?.decks && data?.questions) {
        setDecks(data.decks);
        setQuestions(data.questions);
        if (data?.rawTexts) setRawTexts(data.rawTexts);
        setSelectedDeckId(data.decks[0].id);
        showToast('Data imported successfully!', 'success');
      } else {
        showToast('Invalid backup file format.', 'error');
      }
    } catch (err) {
      console.error('Failed to parse file:', err);
      showToast('Failed to parse file.', 'error');
    } finally {
      e.target.value = null;
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = { decks, questions, rawTexts };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz-forge-backup-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast('Backup exported successfully!', 'success');
    } catch (err) {
      console.error('Failed to export data:', err);
      showToast('Failed to export backup.', 'error');
    }
  };

  const handleMarkQuestion = (id, status) => {
    setQuestions(setQuestionStatus(id, status));
  };

  return {
    decks,
    setDecks,
    selectedDeckId,
    setSelectedDeckId,
    questions,
    setQuestions,
    rawTexts,
    setRawTexts,
    settings,
    setSettings,
    isTyping,
    currentRawText,
    activeDeckQuestions,
    stats,
    handleRawTextChange,
    handleCopyText,
    handleClearTextClick,
    handleAddDeckClick,
    handleDeleteDeckClick,
    handleImport,
    handleExport,
    handleMarkQuestion,
  };
}
