import PropTypes from 'prop-types';
import { BookOpen, Folder, Circle, CheckCircle2, XCircle } from 'lucide-react';

export const DeckOverview = ({ questions, stats, onMarkQuestion }) => {
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

      {questions.length === 0 ? (
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
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl group transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4 mb-3 sm:mb-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  <span className="text-indigo-400 mr-1 font-mono text-xs">{q.number}.</span>{' '}
                  {q.text}
                </div>
              </div>
              <div className="flex items-center space-x-1 shrink-0 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                <button
                  onClick={() => onMarkQuestion(q.id, 'unanswered')}
                  className={`p-2 rounded-md transition-colors ${q.status === 'unanswered' ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                  title="Mark as unanswered"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMarkQuestion(q.id, 'correct')}
                  className={`p-2 rounded-md transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                  title="Mark as correct"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMarkQuestion(q.id, 'incorrect')}
                  className={`p-2 rounded-md transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                  title="Mark as incorrect"
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

DeckOverview.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['unanswered', 'correct', 'incorrect']).isRequired,
    })
  ).isRequired,
  stats: PropTypes.shape({
    total: PropTypes.number.isRequired,
  }).isRequired,
  onMarkQuestion: PropTypes.func.isRequired,
};
