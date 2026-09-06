import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
    removeDeckById,
    removeQuestionsByDeckId,
    mergeQuestions,
    setQuestionStatus,
    extractTags,
} from '../utils/helpers';
import * as Sentry from '@sentry/react';

const QUESTION_REGEX = /^(\d+)[.)]\s+(\S.*)$/;

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
        includePartiallyCorrect: true,
        srsEnabled: false,
    });

    const [isTyping, setIsTyping] = useState(false);
    const currentRawText = rawTexts[selectedDeckId] || '';

    const { activeDeckQuestions, stats } = useMemo(() => {
        const active = [];
        let total = 0,
            unanswered = 0,
            correct = 0,
            incorrect = 0,
            partiallyCorrect = 0;

        for (const q of questions) {
            if (q.deckId === selectedDeckId) {
                active.push(q);
                total++;
                const status = q.status;
                if (status === 'unanswered') unanswered++;
                else if (status === 'correct') correct++;
                else if (status === 'incorrect') incorrect++;
                else if (status === 'partially-correct') partiallyCorrect++;
            }
        }

        return {
            activeDeckQuestions: active,
            stats: { total, unanswered, correct, incorrect, partiallyCorrect },
        };
    }, [questions, selectedDeckId]);

    useEffect(() => {
        Sentry.setTag('srs_enabled', settings.srsEnabled);
    }, [settings.srsEnabled]);

    const handleRawTextChange = useCallback(
        (val) => {
            setRawTexts((prev) => ({ ...prev, [selectedDeckId]: val }));
            setIsTyping(true);
        },
        [selectedDeckId, setRawTexts, setIsTyping]
    );

    const parseTextFromInput = useCallback(
        (text, deckId) => {
            const lines = text.split('\n');
            const parsed = [];
            let currentQ = null;

            lines.forEach((line) => {
                const match = line.match(QUESTION_REGEX);
                if (match) {
                    if (currentQ) {
                        currentQ.tags = [
                            ...new Set([...currentQ.tags, ...extractTags(currentQ.answer)]),
                        ];
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
                const otherDecks = [];
                const activeDeckQuestions = [];
                for (const q of prev) {
                    if (q.deckId === deckId) {
                        activeDeckQuestions.push(q);
                    } else {
                        otherDecks.push(q);
                    }
                }
                const merged = mergeQuestions(activeDeckQuestions, parsed, deckId);
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

    const handleCopyText = useCallback(async () => {
        if (!currentRawText) return;
        try {
            await navigator.clipboard.writeText(currentRawText);
            showToast('Text copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy text:', err);
            showToast('Failed to copy text.', 'error');
        }
    }, [currentRawText, showToast]);

    const handleClearTextClick = useCallback(() => {
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
    }, [setDialog, handleRawTextChange, setQuestions, selectedDeckId, showToast]);

    const handleAddDeckClick = useCallback(() => {
        setDialog({
            isOpen: true,
            type: 'prompt',
            title: 'New Deck',
            message: 'Enter a name for your new deck:',
            defaultValue: '',
            maxLength: 100,
            confirmLabel: 'Create',
            confirmStyle: 'primary',
            onConfirm: (name) => {
                if (name?.trim()) {
                    const trimmedName = name.trim();
                    if (trimmedName.length > 100) {
                        // Prevent LocalStorage exhaustion (Client-Side DoS)
                        showToast('Deck name cannot exceed 100 characters.', 'error');
                        return;
                    }
                    if (decks.some((d) => d.name === trimmedName)) {
                        showToast('A deck with this name already exists.', 'error');
                        return;
                    }
                    const newDeck = { id: crypto.randomUUID(), name: trimmedName };
                    setDecks((prev) => [...prev, newDeck]);
                    setSelectedDeckId(newDeck.id);
                    showToast(`Deck "${newDeck.name}" created!`, 'success');
                }
            },
        });
    }, [setDialog, decks, showToast, setDecks, setSelectedDeckId]);

    const handleDeleteDeckClick = useCallback(() => {
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
    }, [
        decks,
        selectedDeckId,
        showToast,
        setDialog,
        setDecks,
        setQuestions,
        rawTexts,
        setRawTexts,
        setSelectedDeckId,
    ]);

    const handleImport = useCallback(
        async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const json = JSON.parse(text);

                // Dynamic import to avoid loading Zod if not importing
                const { importSchema } = await import('../schemas/importSchema');
                const result = importSchema.safeParse(json);

                if (result.success) {
                    const data = result.data;
                    if (data.decks.length > 0) {
                        setDecks(data.decks);
                        setQuestions(data.questions);
                        if (data.rawTexts) setRawTexts(data.rawTexts);
                        setSelectedDeckId(data.decks[0].id);
                        showToast('Data imported successfully!', 'success');
                    } else {
                        showToast('Invalid backup file format.', 'error');
                    }
                } else {
                    console.error('Validation errors:', result.error.format());
                    showToast('Invalid backup file format.', 'error');
                }
            } catch (err) {
                console.error('Failed to parse file:', err);
                showToast('Failed to parse file.', 'error');
            } finally {
                e.target.value = null;
            }
        },
        [setDecks, setQuestions, setRawTexts, setSelectedDeckId, showToast]
    );

    const handleExport = useCallback(() => {
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
    }, [decks, questions, rawTexts, showToast]);

    const handleMarkQuestion = useCallback(
        (id, status) => {
            setQuestions(setQuestionStatus(id, status));
        },
        [setQuestions]
    );

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
