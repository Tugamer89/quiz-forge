import PropTypes from 'prop-types';

export const ProgressBar = ({ current, total }) => {
  const progress = Math.round((current / total) * 100);
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
        <div
          data-testid="progress-fill"
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
