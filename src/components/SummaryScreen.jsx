import PropTypes from 'prop-types';
import { PieChart } from 'lucide-react';

export const SummaryScreen = ({ session, onReset }) => {
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
