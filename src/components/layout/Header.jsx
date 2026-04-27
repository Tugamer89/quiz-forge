import { useRef } from 'react';
import PropTypes from 'prop-types';
import { BookOpen, Smartphone, Upload, Download, Sun, Moon } from 'lucide-react';

export const Header = ({
  deferredPrompt,
  onInstall,
  onImport,
  onExport,
  isDarkMode,
  toggleTheme,
}) => {
  const fileInputRef = useRef(null);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quiz Forge</h1>
      </div>

      <div className="flex items-center space-x-3 flex-wrap md:flex-nowrap gap-y-2">
        {deferredPrompt && (
          <button
            onClick={onInstall}
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
          onChange={onImport}
          aria-label="Import backup file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500"
        >
          <Upload className="w-4 h-4" /> <span>Import</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500"
        >
          <Download className="w-4 h-4" /> <span>Export</span>
        </button>

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
  deferredPrompt: PropTypes.object,
  onInstall: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};
