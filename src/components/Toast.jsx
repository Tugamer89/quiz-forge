import PropTypes from 'prop-types';
import { Check, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ toast }) => {
  if (!toast.show) return null;

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-800 dark:bg-slate-700',
  };

  const icons = {
    success: <Check className="w-5 h-5 text-white mr-2" />,
    error: <AlertCircle className="w-5 h-5 text-white mr-2" />,
    info: <Info className="w-5 h-5 text-white mr-2" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-xl flex items-center`}
      >
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
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
