import { useState, useMemo, useEffect, useCallback } from 'react';
import { Play, CheckCircle2, XCircle, Circle, RefreshCw, FileText, Settings, BookOpen, Moon, Sun, Trash2 } from 'lucide-react';

// --- Custom Hook for LocalStorage ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = globalThis.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  // Wrapped in useCallback and using functional update to ensure a stable reference
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// --- Helper Functions ---
function mergeQuestions(prevQuestions, parsed) {
  return parsed.map(newQ => {
    const existing = prevQuestions.find(q => q.text === newQ.text);
    if (existing) {
      return { ...newQ, status: existing.status, id: existing.id };
    }
    return newQ;
  });
}

// --- Main Component ---
export default function App() {
  // State
  const [rawText, setRawText] = useLocalStorage('quiz_rawText', '');
  const [questions, setQuestions] = useLocalStorage('quiz_questions', []);
  const [settings, setSettings] = useLocalStorage('quiz_settings', {
    numToGenerate: 5,
    includeUnanswered: true,
    includeCorrect: false,
    includeIncorrect: true,
  });
  
  // Dark Theme State
  const [isDarkMode, setIsDarkMode] = useLocalStorage('quiz_theme_dark', false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showAnswers, setShowAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  // --- Theme Management (Applied to HTML root to fix placeholder bugs) ---
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark'; // Inform browser to use native dark elements
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // --- Parsing Logic (Automated and wrapped in useCallback for dependency safety) ---
  const parseTextFromInput = useCallback((text) => {
    const lines = text.split('\n');
    const parsed = [];
    let currentQ = null;

    // Looks for patterns like "1. Question" or "1) Question"
    const regex = /^(\d+)[.)]\s+(.+)$/;

    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        if (currentQ) parsed.push(currentQ);
        currentQ = {
          id: crypto.randomUUID(),
          number: match[1],
          text: match[2].trim(),
          answer: '',
          status: 'unanswered' // default
        };
      } else if (currentQ) {
        if (currentQ.answer || line.trim()) {
          currentQ.answer += (currentQ.answer ? '\n' : '') + line;
        }
      }
    });
    if (currentQ) parsed.push(currentQ);

    // Merges with existing questions to preserve state (correct/incorrect)
    // Refactored to use mergeQuestions to avoid deep function nesting
    setQuestions(prevQuestions => mergeQuestions(prevQuestions, parsed));
  }, [setQuestions]);

  // --- Automation: Auto-Parsing with Debounce ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      parseTextFromInput(rawText);
      setIsTyping(false);
    }, 800); // Waits 800ms after typing stops before processing

    return () => clearTimeout(timeoutId);
  }, [rawText, parseTextFromInput]); // parseTextFromInput correctly added to dependencies

  // --- Question State Management ---
  const updateQuestionStatus = (id, newStatus) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    
    // Also updates the active quiz if we are in a session
    if (activeQuiz) {
      setActiveQuiz(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    }
  };

  // --- Quiz Generation Logic ---
  const generateQuiz = () => {
    // 1. Filter based on settings
    let eligible = questions.filter(q => {
      if (q.status === 'unanswered' && settings.includeUnanswered) return true;
      if (q.status === 'correct' && settings.includeCorrect) return true;
      if (q.status === 'incorrect' && settings.includeIncorrect) return true;
      return false;
    });

    if (eligible.length === 0) {
      alert("No questions match the selected filters!");
      return;
    }

    // 2. Shuffle (Fisher-Yates algorithm)
    const shuffled = [...eligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Select N questions
    const selected = shuffled.slice(0, settings.numToGenerate);
    
    setActiveQuiz(selected);
    setShowAnswers({}); // Reset shown answers
  };

  const toggleAnswer = (id) => {
    setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Statistics ---
  const stats = useMemo(() => {
    return {
      total: questions.length,
      unanswered: questions.filter(q => q.status === 'unanswered').length,
      correct: questions.filter(q => q.status === 'correct').length,
      incorrect: questions.filter(q => q.status === 'incorrect').length,
    };
  }, [questions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Forge</h1>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Dark Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Input & Settings */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1. Input Text</h2>
                </div>
                {isTyping && (
                  <span className="flex items-center text-xs text-indigo-500 font-medium">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Auto-saving
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Format: <br/> 1. Question text <br/> Answer text
              </p>
              <textarea
                className="w-full h-48 p-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="1. What is HTML?&#10;HyperText Markup Language...&#10;&#10;2. What is CSS?&#10;Cascading Style Sheets..."
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setIsTyping(true); // Moved state update here to avoid effect warnings
                }}
              />
              <button
                onClick={() => {
                  if(confirm("Are you sure you want to clear all text? Statistics will be lost.")) setRawText('');
                }}
                disabled={!rawText}
                className="mt-3 w-full flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Text</span>
              </button>
            </div>

            {/* Settings Section */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2. Quiz Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="numToGenerate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Number of questions
                  </label>
                  <input
                    id="numToGenerate"
                    type="number"
                    min="1"
                    max={questions.length || 100}
                    value={settings.numToGenerate}
                    onChange={(e) => setSettings({ ...settings, numToGenerate: Number.parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-slate-200"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Include categories
                  </span>
                  <div className="space-y-2">
                    <label htmlFor="incUnanswered" className="flex items-center space-x-2 cursor-pointer">
                      <input
                        id="incUnanswered"
                        type="checkbox"
                        checked={settings.includeUnanswered}
                        onChange={(e) => setSettings({ ...settings, includeUnanswered: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Unanswered ({stats.unanswered})</span>
                    </label>
                    <label htmlFor="incIncorrect" className="flex items-center space-x-2 cursor-pointer">
                      <input
                        id="incIncorrect"
                        type="checkbox"
                        checked={settings.includeIncorrect}
                        onChange={(e) => setSettings({ ...settings, includeIncorrect: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Incorrect ({stats.incorrect})</span>
                    </label>
                    <label htmlFor="incCorrect" className="flex items-center space-x-2 cursor-pointer">
                      <input
                        id="incCorrect"
                        type="checkbox"
                        checked={settings.includeCorrect}
                        onChange={(e) => setSettings({ ...settings, includeCorrect: e.target.checked })}
                        className="rounded text-green-600 focus:ring-green-500 w-4 h-4 dark:bg-slate-900 dark:border-slate-600"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Correct ({stats.correct})</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateQuiz}
                  disabled={questions.length === 0}
                  className="w-full mt-4 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  <Play className="w-5 h-5" />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Active Session & Database */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Quiz Area */}
            {activeQuiz && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-2 border-indigo-200 dark:border-indigo-800 transition-colors">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Session</h2>
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {activeQuiz.length} Questions
                  </span>
                </div>

                <div className="space-y-6">
                  {activeQuiz.map((q, index) => (
                    <div key={q.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 transition-colors">
                      <div className="font-medium text-lg mb-3 flex items-start text-slate-900 dark:text-slate-100">
                        <span className="text-indigo-500 dark:text-indigo-400 mr-2">{index + 1}.</span>
                        {q.text}
                      </div>
                      
                      {showAnswers[q.id] ? (
                        <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm transition-colors">
                          {q.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium py-1"
                        >
                          Show Answer
                        </button>
                      )}

                      {/* State Setting from Active Quiz */}
                      {showAnswers[q.id] && (
                        <div className="mt-4 flex items-center space-x-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Mark as:</span>
                          <button 
                            onClick={() => updateQuestionStatus(q.id, 'correct')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                          >
                            <CheckCircle2 className="w-4 h-4" /> <span>Correct</span>
                          </button>
                          <button 
                            onClick={() => updateQuestionStatus(q.id, 'incorrect')}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                          >
                            <XCircle className="w-4 h-4" /> <span>Incorrect</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parsed Database View */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
               <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center text-slate-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                  All Questions ({stats.total})
                </h2>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                  No questions parsed yet. Paste your text in the left box to start.
                </div>
              ) : (
                <div className="max-h-125 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {questions.map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg transition-colors group">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-4 mb-2 sm:mb-0">
                        {q.number}. {q.text}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updateQuestionStatus(q.id, 'unanswered')}
                          title="Unanswered"
                          className={`p-1.5 rounded-md transition-colors ${q.status === 'unanswered' ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateQuestionStatus(q.id, 'correct')}
                          title="Correct"
                          className={`p-1.5 rounded-md transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateQuestionStatus(q.id, 'incorrect')}
                          title="Incorrect"
                          className={`p-1.5 rounded-md transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}