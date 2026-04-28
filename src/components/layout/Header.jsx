import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CloudSync } from '../features/CloudSync';
import {
  BookOpen,
  Smartphone,
  Upload,
  Download,
  Sun,
  Moon,
  Database,
  ChevronDown,
} from 'lucide-react';

export const Header = ({
  decks,
  questions,
  rawTexts,
  setDecks,
  setQuestions,
  setRawTexts,
  showToast,
  deferredPrompt,
  onInstall,
  onImport,
  onExport,
  isDarkMode,
  toggleTheme,
}) => {
  const fileInputRef = useRef(null);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDataMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportWrapper = (e) => {
    onImport(e);
    setIsDataMenuOpen(false);
  };

  const handleExportWrapper = () => {
    onExport();
    setIsDataMenuOpen(false);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Forge</h1>
      </div>

      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
        {deferredPrompt && (
          <button
            onClick={onInstall}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 hover:scale-105 hover:-translate-y-0.5 duration-500 shadow-indigo-500/20 active:scale-95"
          >
            <Smartphone className="w-4 h-4" /> <span>Install App</span>
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500"
          >
            <Database className="w-4 h-4" /> <span>Data & Sync</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isDataMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDataMenuOpen && (
            <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-menu-enter transform origin-top">
              <div className="py-2">
                <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Local Storage
                </div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImportWrapper}
                  aria-label="Import backup file"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" /> Import
                  Backup
                </button>
                <button
                  onClick={handleExportWrapper}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2.5 text-slate-500 dark:text-slate-400" /> Export
                  Backup
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1.5 mx-2"></div>

                <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Cloud Sync
                </div>
                <CloudSync
                  decks={decks}
                  questions={questions}
                  rawTexts={rawTexts}
                  showToast={showToast}
                  onImportData={(data) => {
                    setDecks(data.decks);
                    setQuestions(data.questions);
                    if (data.rawTexts) setRawTexts(data.rawTexts);
                  }}
                  onActionComplete={() => setIsDataMenuOpen(false)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mr-3 hidden md:block"></div>

        <button
          onClick={toggleTheme}
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
  );
};

Header.propTypes = {
  decks: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  rawTexts: PropTypes.object.isRequired,
  setDecks: PropTypes.func.isRequired,
  setQuestions: PropTypes.func.isRequired,
  setRawTexts: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  deferredPrompt: PropTypes.object,
  onInstall: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};
