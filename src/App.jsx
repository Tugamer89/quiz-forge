import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  removeDeckById,
  removeQuestionsByDeckId,
  setQuestionStatus,
  mergeQuestions,
} from './utils/helpers';

// Shared Components
import { CustomDialog } from './components/CustomDialog';
import { Toast } from './components/Toast';
import { SummaryScreen } from './components/SummaryScreen';

// Layout & Features
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SidebarControls } from './components/features/SidebarControls';
import { DeckOverview } from './components/features/DeckOverview';
import { LiveSession } from './components/features/LiveSession';

export default function App() {
  // --- STATE ---
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
  });
  const [isDarkMode, setIsDarkMode] = useLocalStorage('quiz_theme_dark', false);

  const [quizSession, setQuizSession] = useState({
    active: false,
    isFinished: false,
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    onConfirm: () => {},
  });

  const currentRawText = rawTexts[selectedDeckId] || '';

  // --- EFFECTS ---
  useEffect(() => {
    const root = document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    globalThis.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => globalThis.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // --- UTILS & HANDLERS ---
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false }), 3000);
  }, []);

  const handleRawTextChange = (val) => {
    setRawTexts((prev) => ({ ...prev, [selectedDeckId]: val }));
    setIsTyping(true);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('Thank you for installing Quiz Forge!', 'success');
    }

    setDeferredPrompt(null);
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
          if (currentQ) parsed.push(currentQ);
          currentQ = {
            id: crypto.randomUUID(),
            number: match[1],
            text: match[2].trim(),
            answer: '',
            status: 'unanswered',
            deckId,
          };
        } else if (currentQ && (currentQ.answer || line.trim())) {
          currentQ.answer += (currentQ.answer ? '\n' : '') + line;
        }
      });
      if (currentQ) parsed.push(currentQ);

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

        // Pulisci il raw text del deck eliminato
        const newRawTexts = { ...rawTexts };
        delete newRawTexts[selectedDeckId];
        setRawTexts(newRawTexts);

        // Seleziona un deck che NON sia quello appena eliminato
        setSelectedDeckId(decks.find((d) => d.id !== selectedDeckId).id);
        showToast('Deck deleted.', 'info');
      },
    });
  };

  // --- QUIZ LOGIC ---
  const generateQuiz = () => {
    const eligible = questions.filter(
      (q) =>
        q.deckId === selectedDeckId &&
        ((q.status === 'unanswered' && settings.includeUnanswered) ||
          (q.status === 'correct' && settings.includeCorrect) ||
          (q.status === 'incorrect' && settings.includeIncorrect))
    );

    if (!eligible.length) return showToast('No questions match filters!', 'error');

    const shuffled = [...eligible].sort(() => 0.5 - Math.random()).slice(0, settings.numToGenerate);
    setQuizSession({
      active: true,
      isFinished: false,
      questions: shuffled,
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
    });
    setShowAnswer(false);
  };

  const handleAnswer = (isCorrect) => {
    const currentQ = quizSession.questions[quizSession.currentIndex];
    setQuestions(setQuestionStatus(currentQ.id, isCorrect ? 'correct' : 'incorrect'));
    setQuizSession((prev) => {
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
        currentIndex: nextIndex,
        active: nextIndex < prev.questions.length,
        isFinished: nextIndex >= prev.questions.length,
      };
    });
    setShowAnswer(false);
  };

  // --- DERIVED STATE ---
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

  // --- IMPORT LOGIC ---
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

  // --- EXPORT LOGIC ---
  const handleExport = () => {
    try {
      const dataToExport = {
        decks,
        questions,
        rawTexts,
      };

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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-200 selection:bg-indigo-200 dark:selection:bg-indigo-900">
      <Toast toast={toast} />
      {dialog.isOpen && (
        <CustomDialog dialog={dialog} onClose={() => setDialog({ isOpen: false })} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <Header
          deferredPrompt={deferredPrompt}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          onInstall={handleInstallApp}
          onExport={handleExport}
          onImport={handleImport}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <SidebarControls
              decks={decks}
              selectedDeckId={selectedDeckId}
              onSelectDeck={(id) => {
                setSelectedDeckId(id);
                setQuizSession((prev) => ({ ...prev, active: false }));
              }}
              onAddDeck={handleAddDeckClick}
              onDeleteDeck={handleDeleteDeckClick}
              currentRawText={currentRawText}
              onRawTextChange={handleRawTextChange}
              isTyping={isTyping}
              onCopyText={handleCopyText}
              onClearText={handleClearTextClick}
              settings={settings}
              onSettingsChange={setSettings}
              activeDeckQuestionsLength={activeDeckQuestions.length}
              stats={stats}
              onGenerateQuiz={generateQuiz}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {quizSession.active && !quizSession.isFinished && (
              <LiveSession
                session={quizSession}
                showAnswer={showAnswer}
                onCancel={() => setQuizSession((p) => ({ ...p, active: false }))}
                onReveal={() => setShowAnswer(true)}
                onAnswer={handleAnswer}
              />
            )}
            {quizSession.isFinished && (
              <SummaryScreen
                session={quizSession}
                onReset={() => setQuizSession((p) => ({ ...p, isFinished: false, active: false }))}
              />
            )}
            {!quizSession.active && !quizSession.isFinished && (
              <DeckOverview
                questions={activeDeckQuestions}
                stats={stats}
                onMarkQuestion={(id, status) => setQuestions(setQuestionStatus(id, status))}
              />
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
