import PropTypes from 'prop-types';
import {
  Folder,
  Plus,
  Trash2,
  FileText,
  RefreshCw,
  Copy,
  Eraser,
  Settings,
  Play,
  BrainCircuit,
} from 'lucide-react';

export const SidebarControls = ({
  decks,
  selectedDeckId,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
  currentRawText,
  onRawTextChange,
  isTyping,
  onCopyText,
  onClearText,
  settings,
  onSettingsChange,
  stats,
  activeDeckQuestionsLength,
  onGenerateQuiz,
}) => {
  return (
    <div className="space-y-6">
      {/* Deck Selector */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-2 mb-4">
          <Folder className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Deck</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedDeckId}
            onChange={(e) => onSelectDeck(e.target.value)}
            className="flex-1 py-2 pl-3 bg-position-[calc(100%-20px)_center] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white text-sm"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            onClick={onAddDeck}
            className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-lg transition-colors"
            title="Add Deck"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onDeleteDeck}
            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            title="Delete Deck"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Raw Text Input */}
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
          className="w-full h-48 p-3 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
          placeholder="1. Markdown works! #hashtag&#10;Use **bold**, *italic*, and `code`.&#10;&#10;2. Another question?&#10;The answer goes here..."
          value={currentRawText}
          onChange={(e) => onRawTextChange(e.target.value)}
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={onCopyText}
            disabled={!currentRawText}
            className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <Copy className="w-4 h-4" /> <span>Copy</span>
          </button>
          <button
            onClick={onClearText}
            disabled={!currentRawText}
            className="flex-1 flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <Eraser className="w-4 h-4" /> <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quiz Setup</h2>
        </div>

        <div className="space-y-5">
          {/* SRS Toggle */}
          <label className="flex items-center justify-between p-3 border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg cursor-pointer group">
            <div className="flex items-center space-x-3">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Spaced Repetition (SRS)
              </span>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.srsEnabled || false}
                onChange={(e) => onSettingsChange({ ...settings, srsEnabled: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
            </div>
          </label>

          <div>
            <label
              htmlFor="numToGenerate"
              className="block text-sm font-medium mb-1 dark:text-slate-300"
            >
              Questions per session
            </label>
            <input
              id="numToGenerate"
              type="number"
              min="1"
              max={activeDeckQuestionsLength || 100}
              value={settings.numToGenerate}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  numToGenerate: Number.parseInt(e.target.value) || 1,
                })
              }
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            />
          </div>

          <div
            className={`transition-opacity ${settings.srsEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
          >
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Include from {decks.find((d) => d.id === selectedDeckId)?.name}:
            </span>

            <div className="space-y-2">
              {['Unanswered', 'Incorrect', 'Correct'].map((type) => {
                const key = `include${type}`;
                const inputId = `inc${type}`;
                const statKey = type.toLowerCase();

                const badgeColors = {
                  Unanswered: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  Correct: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  Incorrect: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                };

                const inputColors = {
                  Unanswered: 'text-indigo-600 focus:ring-indigo-500',
                  Correct: 'text-green-600 focus:ring-green-500',
                  Incorrect: 'text-red-600 focus:ring-red-500',
                };

                return (
                  <label
                    htmlFor={inputId}
                    key={type}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      aria-label={`Include ${type} questions`}
                      checked={settings[key]}
                      onChange={(e) => onSettingsChange({ ...settings, [key]: e.target.checked })}
                      className={`rounded w-4 h-4 cursor-pointer ${inputColors[type]} bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 transition-colors`}
                    />
                    <div className="flex justify-between flex-1 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <span>{type}</span>
                      <span
                        className={`${badgeColors[type]} px-2 py-0.5 rounded-full text-xs font-semibold transition-colors`}
                      >
                        {stats[statKey]}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            {settings.srsEnabled && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
                * Filters are disabled because Spaced Repetition (SRS) auto-selects due cards.
              </p>
            )}
          </div>

          <button
            onClick={onGenerateQuiz}
            disabled={activeDeckQuestionsLength === 0}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-sm active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

SidebarControls.propTypes = {
  decks: PropTypes.array.isRequired,
  selectedDeckId: PropTypes.string.isRequired,
  onSelectDeck: PropTypes.func.isRequired,
  onAddDeck: PropTypes.func.isRequired,
  onDeleteDeck: PropTypes.func.isRequired,
  currentRawText: PropTypes.string.isRequired,
  onRawTextChange: PropTypes.func.isRequired,
  isTyping: PropTypes.bool.isRequired,
  onCopyText: PropTypes.func.isRequired,
  onClearText: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  onSettingsChange: PropTypes.func.isRequired,
  stats: PropTypes.object.isRequired,
  activeDeckQuestionsLength: PropTypes.number.isRequired,
  onGenerateQuiz: PropTypes.func.isRequired,
};
