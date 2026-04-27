import PropTypes from 'prop-types';

export const ProgressBar = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
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
