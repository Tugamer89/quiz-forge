import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Play,
  CheckCircle2,
  XCircle,
  Circle,
  RefreshCw,
  FileText,
  Settings,
  BookOpen,
  Moon,
  Sun,
  Trash2,
  Download,
  Upload,
  Plus,
  Folder,
  PieChart,
  ArrowRight,
  Check,
  AlertCircle,
  Info,
  Eraser,
  Copy,
  Smartphone,
  Heart,
  ExternalLink,
} from 'lucide-react';

// --- State Updaters & Helpers ---

const removeDeckById = (deckId) => (prevDecks) => prevDecks.filter((d) => d.id !== deckId);

const removeQuestionsByDeckId = (deckId) => (prevQuestions) =>
  prevQuestions.filter((q) => q.deckId !== deckId);

const setQuestionStatus = (questionId, newStatus) => (prevQuestions) =>
  prevQuestions.map((q) => (q.id === questionId ? { ...q, status: newStatus } : q));

function mergeQuestions(prevQuestions, parsed, currentDeckId) {
  return parsed.map((newQ) => {
    const existing = prevQuestions.find((q) => q.text === newQ.text && q.deckId === currentDeckId);
    if (existing) {
      return { ...newQ, status: existing.status, id: existing.id, deckId: currentDeckId };
    }
    return { ...newQ, deckId: currentDeckId };
  });
}

// Simple Markdown Parser (Bold, Italic, Inline Code)
const formatMarkdown = (text) => {
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

// --- Custom Hooks ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = globalThis.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = typeof value === 'function' ? value(prev) : value;
          globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// --- Sub-Components ---

const CustomDialog = ({ dialog, onClose }) => {
  const [inputVal, setInputVal] = useState(dialog.defaultValue || '');

  const handleConfirm = () => {
    dialog.onConfirm(dialog.type === 'prompt' ? inputVal : true);
    onClose();
  };

  const btnColor =
    dialog.confirmStyle === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dialog.title}</h3>
        {dialog.message && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{dialog.message}</p>
        )}
        {dialog.type === 'prompt' && (
          <input
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
          />
        )}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnColor}`}
          >
            {dialog.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

CustomDialog.propTypes = {
  dialog: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['confirm', 'prompt']).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    defaultValue: PropTypes.string,
    confirmLabel: PropTypes.string,
    confirmStyle: PropTypes.oneOf(['primary', 'danger']),
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

const Toast = ({ toast }) => {
  if (!toast.show) return null;

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-800 dark:bg-slate-700',
  };

  const icons = {
    success: <Check className="w-5 h-5 text-white mr-2" />,
    error: <AlertCircle className="w-5 h-5 text-white mr-2" />,
    info: <Info className="w-5 h-5 text-white mr-2" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-xl flex items-center`}
      >
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  }).isRequired,
};

const ProgressBar = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        <span>Progress</span>
        <span>
          {current} / {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const SummaryScreen = ({ session, onReset }) => {
  const total = session.questions.length;
  const percentage = Math.round((session.correctCount / total) * 100);

  let message = 'Keep practicing!';
  if (percentage >= 80) message = 'Outstanding job!';
  else if (percentage >= 50) message = 'Good effort!';

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center h-full min-h-125">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-6">
        <PieChart className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Complete!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{message}</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 p-4 rounded-xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {session.correctCount}
          </div>
          <div className="text-sm font-medium text-green-700/70 dark:text-green-400/70">
            Correct
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 p-4 rounded-xl">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {session.incorrectCount}
          </div>
          <div className="text-sm font-medium text-red-700/70 dark:text-green-400/70">
            Incorrect
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-sm"
      >
        Back to Database
      </button>
    </div>
  );
};

SummaryScreen.propTypes = {
  session: PropTypes.shape({
    questions: PropTypes.array.isRequired,
    correctCount: PropTypes.number.isRequired,
    incorrectCount: PropTypes.number.isRequired,
  }).isRequired,
  onReset: PropTypes.func.isRequired,
};

// --- Main Application Component ---
export default function App() {
  // State: Core Data
  const [decks, setDecks] = useLocalStorage('quiz_decks', [
    { id: 'default', name: 'General Knowledge' },
  ]);
  const [selectedDeckId, setSelectedDeckId] = useLocalStorage('quiz_selected_deck', 'default');
  const [questions, setQuestions] = useLocalStorage('quiz_questions', []);
  const [rawTexts, setRawTexts] = useLocalStorage('quiz_rawTexts', { default: '' });

  // State: Settings & Theme
  const [settings, setSettings] = useLocalStorage('quiz_settings', {
    numToGenerate: 5,
    includeUnanswered: true,
    includeCorrect: false,
    includeIncorrect: true,
  });
  const [isDarkMode, setIsDarkMode] = useLocalStorage('quiz_theme_dark', false);

  // State: Active Session
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

  // State: PWA Installation
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // State: UI Components
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    defaultValue: '',
    confirmLabel: '',
    confirmStyle: 'primary',
    onConfirm: () => {},
  });
  const fileInputRef = useRef(null);

  const currentRawText = rawTexts[selectedDeckId] || '';

  // --- Theme Effect ---
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // --- PWA Installation Effect ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevents the browser from showing its own prompt
      e.preventDefault();
      // Store the event to trigger it later
      setDeferredPrompt(e);
    };

    globalThis.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      globalThis.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- UI Helpers ---
  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // --- Installation Handler ---
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('Thank you for installing Quiz Forge!', 'success');
    }

    setDeferredPrompt(null);
  };

  // --- Deck Management ---
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
        setRawTexts((prev) => ({ ...prev, [selectedDeckId]: '' }));
        setQuestions(removeQuestionsByDeckId(selectedDeckId));
        showToast('Text cleared.', 'info');
      },
    });
  };

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

  // --- Parsing Logic ---
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
            deckId: deckId,
          };
        } else if (currentQ) {
          if (currentQ.answer || line.trim()) {
            currentQ.answer += (currentQ.answer ? '\n' : '') + line;
          }
        }
      });
      if (currentQ) parsed.push(currentQ);

      setQuestions((prevQuestions) => {
        const otherDecksQuestions = prevQuestions.filter((q) => q.deckId !== deckId);
        const mergedCurrentDeck = mergeQuestions(
          prevQuestions.filter((q) => q.deckId === deckId),
          parsed,
          deckId
        );
        return [...otherDecksQuestions, ...mergedCurrentDeck];
      });
    },
    [setQuestions]
  );

  // --- Auto-Parsing Effect ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseTextFromInput(currentRawText, selectedDeckId);
      setIsTyping(false);
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [currentRawText, selectedDeckId, parseTextFromInput]);

  // --- Quiz Flow ---
  const generateQuiz = () => {
    const currentDeckQuestions = questions.filter((q) => q.deckId === selectedDeckId);

    let eligible = currentDeckQuestions.filter((q) => {
      if (q.status === 'unanswered' && settings.includeUnanswered) return true;
      if (q.status === 'correct' && settings.includeCorrect) return true;
      if (q.status === 'incorrect' && settings.includeIncorrect) return true;
      return false;
    });

    if (eligible.length === 0) {
      showToast('No questions match the selected filters in this deck!', 'error');
      return;
    }

    const shuffled = [...eligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, settings.numToGenerate);

    setQuizSession({
      active: true,
      isFinished: false,
      questions: selected,
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
      const isFinished = nextIndex >= prev.questions.length;

      const addedCorrect = isCorrect ? 1 : 0;
      const addedIncorrect = isCorrect ? 0 : 1;

      return {
        ...prev,
        correctCount: prev.correctCount + addedCorrect,
        incorrectCount: prev.incorrectCount + addedIncorrect,
        currentIndex: nextIndex,
        active: !isFinished,
        isFinished: isFinished,
      };
    });
    setShowAnswer(false);
  };

  // --- Import / Export ---
  const exportData = () => {
    const dataStr = JSON.stringify({ decks, questions, rawTexts });
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported successfully!', 'success');
  };

  const importData = async (e) => {
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
      e.target.value = null; // reset input
    }
  };

  // --- Derived State ---
  const activeDeckQuestions = useMemo(
    () => questions.filter((q) => q.deckId === selectedDeckId),
    [questions, selectedDeckId]
  );

  const stats = useMemo(() => {
    return {
      total: activeDeckQuestions.length,
      unanswered: activeDeckQuestions.filter((q) => q.status === 'unanswered').length,
      correct: activeDeckQuestions.filter((q) => q.status === 'correct').length,
      incorrect: activeDeckQuestions.filter((q) => q.status === 'incorrect').length,
    };
  }, [activeDeckQuestions]);

  // --- View Helpers ---
  const renderMainContent = () => {
    if (quizSession.active && !quizSession.isFinished) {
      return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-xl shadow-md border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-in fade-in duration-300 flex flex-col min-h-125">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <Play className="w-5 h-5 text-indigo-500 mr-2" /> Live Session
            </h2>
            <button
              onClick={() => setQuizSession((prev) => ({ ...prev, active: false }))}
              className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <ProgressBar
            current={quizSession.currentIndex + 1}
            total={quizSession.questions.length}
          />

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-6 text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
              {formatMarkdown(quizSession.questions[quizSession.currentIndex]?.text)}
            </div>

            {showAnswer ? (
              <div className="mt-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-slate-700 dark:text-slate-300 text-lg whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-4 fade-in duration-200">
                {formatMarkdown(quizSession.questions[quizSession.currentIndex]?.answer)}
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-6 flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-lg w-full group"
              >
                <span>Reveal Answer</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
              </button>
            )}
          </div>

          <div
            className={`mt-10 flex gap-4 transition-all duration-300 ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-95"
            >
              <XCircle className="w-8 h-8 mb-2" />
              <span className="font-bold">Incorrect</span>
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl transition-all active:scale-95"
            >
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <span className="font-bold">Correct</span>
            </button>
          </div>
        </div>
      );
    }

    if (quizSession.isFinished) {
      return (
        <SummaryScreen
          session={quizSession}
          onReset={() => setQuizSession((prev) => ({ ...prev, isFinished: false, active: false }))}
        />
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex flex-col h-full min-h-125">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
            <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
            Deck Overview
          </h2>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold px-3 py-1 rounded-full">
            {stats.total} Total
          </span>
        </div>

        {activeDeckQuestions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8">
            <Folder className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              This deck is empty.
              <br />
              Add questions in the raw text box.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-150">
            {activeDeckQuestions.map((q) => (
              <div
                key={q.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-4 mb-3 sm:mb-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    <span className="text-indigo-400 mr-1 font-mono text-xs">{q.number}.</span>{' '}
                    {q.text}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                  <button
                    onClick={() => setQuestions(setQuestionStatus(q.id, 'unanswered'))}
                    title="Mark Unanswered"
                    className={`p-2 rounded-md transition-colors ${q.status === 'unanswered' ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestions(setQuestionStatus(q.id, 'correct'))}
                    title="Mark Correct"
                    className={`p-2 rounded-md transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestions(setQuestionStatus(q.id, 'incorrect'))}
                    title="Mark Incorrect"
                    className={`p-2 rounded-md transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-200 selection:bg-indigo-200 dark:selection:bg-indigo-900">
      <Toast toast={toast} />
      {dialog.isOpen && <CustomDialog dialog={dialog} onClose={closeDialog} />}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Forge</h1>
          </div>

          <div className="flex items-center space-x-3 flex-wrap md:flex-nowrap gap-y-2">
            {/* Install Button (PWA) */}
            {deferredPrompt && (
              <button
                onClick={handleInstallApp}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 hover:scale-105 hover:-translate-y-0.5 duration-500 shadow-indigo-500/20 active:scale-95"
              >
                <Smartphone className="w-4 h-4" /> <span>Install App</span>
              </button>
            )}

            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={importData}
              aria-label="Import backup file"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500"
            >
              <Upload className="w-4 h-4" /> <span>Import</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500"
            >
              <Download className="w-4 h-4" /> <span>Export</span>
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Dark Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deck Selector */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2 mb-4">
                <Folder className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Deck</h2>
              </div>
              <div className="flex gap-2">
                <select
                  aria-label="Select Deck"
                  value={selectedDeckId}
                  onChange={(e) => {
                    setSelectedDeckId(e.target.value);
                    if (quizSession.active) setQuizSession((prev) => ({ ...prev, active: false }));
                  }}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white text-sm"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddDeckClick}
                  className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-lg transition-colors"
                  title="Add Deck"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeleteDeckClick}
                  className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  title="Delete Deck"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Raw Text</h2>
                </div>
                {isTyping && (
                  <span className="flex items-center text-xs text-indigo-500 font-medium animate-pulse">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Saving...
                  </span>
                )}
              </div>
              <textarea
                aria-label="Raw Text Input"
                className="w-full h-48 p-3 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                placeholder="1. Markdown works!&#10;Use **bold**, *italic*, and `code`.&#10;&#10;2. Another question?&#10;The answer goes here..."
                value={currentRawText}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawTexts((prev) => ({ ...prev, [selectedDeckId]: val }));
                  setIsTyping(true);
                }}
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleCopyText}
                  disabled={!currentRawText}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" /> <span>Copy Text</span>
                </button>
                <button
                  onClick={handleClearTextClick}
                  disabled={!currentRawText}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <Eraser className="w-4 h-4" /> <span>Clear Text</span>
                </button>
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz Setup</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="numToGenerate"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Questions to practice
                  </label>
                  <input
                    id="numToGenerate"
                    type="number"
                    min="1"
                    max={activeDeckQuestions.length || 100}
                    value={settings.numToGenerate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        numToGenerate: Number.parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white text-sm"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Include from {decks.find((d) => d.id === selectedDeckId)?.name}:
                  </span>
                  <div className="space-y-2">
                    <label
                      htmlFor="incUnanswered"
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <input
                        id="incUnanswered"
                        aria-label="Include Unanswered"
                        type="checkbox"
                        checked={settings.includeUnanswered}
                        onChange={(e) =>
                          setSettings({ ...settings, includeUnanswered: e.target.checked })
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                      />
                      <div className="flex justify-between flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        <span>Unanswered</span>{' '}
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {stats.unanswered}
                        </span>
                      </div>
                    </label>
                    <label
                      htmlFor="incIncorrect"
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <input
                        id="incIncorrect"
                        aria-label="Include Incorrect"
                        type="checkbox"
                        checked={settings.includeIncorrect}
                        onChange={(e) =>
                          setSettings({ ...settings, includeIncorrect: e.target.checked })
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                      />
                      <div className="flex justify-between flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        <span>Incorrect</span>{' '}
                        <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {stats.incorrect}
                        </span>
                      </div>
                    </label>
                    <label
                      htmlFor="incCorrect"
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <input
                        id="incCorrect"
                        aria-label="Include Correct"
                        type="checkbox"
                        checked={settings.includeCorrect}
                        onChange={(e) =>
                          setSettings({ ...settings, includeCorrect: e.target.checked })
                        }
                        className="rounded text-green-600 focus:ring-green-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                      />
                      <div className="flex justify-between flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        <span>Correct</span>{' '}
                        <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {stats.correct}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={activeDeckQuestions.length === 0}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Viewport */}
          <div className="lg:col-span-2 space-y-6">{renderMainContent()}</div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-10 pb-8 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  Quiz Forge
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left italic">
                Empowering your learning journey by turning raw notes into powerful knowledge tools.
                Forge your path to mastery.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Project
                </span>
                <div className="flex flex-col items-center space-y-1">
                  <a
                    href="https://github.com/tugamer89/quiz-forge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center group"
                  >
                    Project Source
                    <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                  <a
                    href="https://github.com/tugamer89/quiz-forge/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center group"
                  >
                    Report an Issue
                    <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-all" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-300 dark:text-slate-600">
                  Built with
                </span>
                <div className="flex items-center space-x-3 text-xs">
                  <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                  >
                    React
                  </a>
                  <a
                    href="https://tailwindcss.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                  >
                    Tailwind
                  </a>
                  <a
                    href="https://lucide.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                  >
                    Lucide
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-4">
              <div className="flex flex-col items-center md:items-end space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Developed by
                </span>
                <a
                  href="https://github.com/tugamer89"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 group bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
                >
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Tugamer89
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-current text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center border-t border-slate-100 dark:border-slate-800/50 pt-6">
            <div className="flex items-center space-x-1 text-xs font-medium text-slate-400">
              <span>© {new Date().getFullYear()} Quiz Forge. Crafted with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current mx-0.5 animate-pulse" />
              <span>for lifelong learners.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
