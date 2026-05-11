import PropTypes from 'prop-types';

export const ProgressBar = ({ current, total }) => {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;
  const percentage = Math.max(0, Math.min(progress, 100));

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        <span>Progress</span>
        <span>
          {current} / {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <progress
          id="quiz-progress"
          value={current}
          max={total}
          className="w-full h-2.5 rounded-full appearance-none block [&::-webkit-progress-bar]:bg-slate-200 dark:[&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-indigo-600 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-500 [&::-moz-progress-bar]:bg-indigo-600 [&::-moz-progress-bar]:rounded-full"
        >
          {percentage}%
        </progress>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
