import PropTypes from 'prop-types';
import { Play, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';
import { formatMarkdown } from '../../utils/helpers';

export const LiveSession = ({ session, onCancel, showAnswer, onReveal, onAnswer }) => {
  const currentQ = session.questions[session.currentIndex];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-xl shadow-md border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-in fade-in duration-300 flex flex-col min-h-125">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
          <Play className="w-5 h-5 text-indigo-500 mr-2" /> Live Session
        </h2>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>

      <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-6 text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
          {formatMarkdown(currentQ?.text)}
        </div>

        {showAnswer ? (
          <div className="mt-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-slate-700 dark:text-slate-300 text-lg whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-4 fade-in duration-200">
            {formatMarkdown(currentQ?.answer)}
          </div>
        ) : (
          <button
            onClick={onReveal}
            className="mt-6 flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all font-medium text-lg w-full group"
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
          onClick={() => onAnswer(false)}
          className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-95"
        >
          <XCircle className="w-8 h-8 mb-2" />
          <span className="font-bold">Incorrect</span>
        </button>
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl transition-all active:scale-95"
        >
          <CheckCircle2 className="w-8 h-8 mb-2" />
          <span className="font-bold">Correct</span>
        </button>
      </div>
    </div>
  );
};

LiveSession.propTypes = {
  session: PropTypes.shape({
    questions: PropTypes.array.isRequired,
    currentIndex: PropTypes.number.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  showAnswer: PropTypes.bool.isRequired,
  onReveal: PropTypes.func.isRequired,
  onAnswer: PropTypes.func.isRequired,
};
