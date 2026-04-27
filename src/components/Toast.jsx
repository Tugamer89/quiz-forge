import PropTypes from 'prop-types';
import { Check, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ toast }) => {
  if (!toast.show) return null;

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-800 dark:bg-slate-700',
  };

  const progressColors = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    info: 'bg-slate-500 dark:bg-slate-400',
  };

  const icons = {
    success: <Check className="w-5 h-5 text-white mr-3" />,
    error: <AlertCircle className="w-5 h-5 text-white mr-3" />,
    info: <Info className="w-5 h-5 text-white mr-3" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast-enter">
      <div
        className={`${bgColors[toast.type]} text-white rounded-lg shadow-xl overflow-hidden min-w-70 max-w-sm flex flex-col`}
      >
        <div className="px-4 py-3 flex items-center">
          {icons[toast.type]}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
        <div
          className={`h-1 w-full ${progressColors[toast.type]} animate-toast-progress origin-left`}
        />
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  }).isRequired,
};
