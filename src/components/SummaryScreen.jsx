import PropTypes from 'prop-types';
import { PieChart, Database, Zap } from 'lucide-react';

export const SummaryScreen = ({ session, onReset, onPlayAgain }) => {
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
          <div className="text-sm font-medium text-red-700/70 dark:text-red-400/70">Incorrect</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold transition-all duration-200 active:scale-95 group shadow-sm"
        >
          <Database className="w-5 h-5 text-slate-500 group-hover:scale-110 transition-transform" />
          Exit Quiz
        </button>

        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 shadow-md shadow-indigo-200 dark:shadow-none active:scale-95 group"
        >
          <Zap className="w-5 h-5 group-hover:animate-pulse" />
          Play Again
        </button>
      </div>
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
  onPlayAgain: PropTypes.func.isRequired,
};
