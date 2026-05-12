import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export const CustomDialog = ({ dialog, onClose }) => {
    const [inputVal, setInputVal] = useState(dialog.defaultValue || '');
    const dialogRef = useRef(null);

    useEffect(() => {
        if (dialog.isOpen && dialogRef.current) {
            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        } else if (dialogRef.current?.open) {
            dialogRef.current.close();
        }
    }, [dialog.isOpen]);

    const handleConfirm = () => {
        dialog.onConfirm(dialog.type === 'prompt' ? inputVal : true);
        onClose();
    };

    const handleCancel = (e) => {
        e.preventDefault();
        onClose();
    };

    const btnColor =
        dialog.confirmStyle === 'danger'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white';

    return (
        <dialog
            ref={dialogRef}
            onCancel={handleCancel}
            className="fixed inset-0 z-100 m-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-sm w-[calc(100%-2rem)] border border-slate-200 dark:border-slate-700 backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm animate-in zoom-in-95 duration-200 block"
        >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-left">
                {dialog.icon}
                <span>{dialog.title}</span>
            </h3>
            {dialog.message && (
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{dialog.message}</p>
            )}
            {dialog.type === 'prompt' && (
                <input
                    autoFocus
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                />
            )}
            <div className="flex justify-end gap-3 mt-2">
                <button
                    onClick={onClose}
                    title="Cancel"
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    title={dialog.confirmLabel || 'Confirm'}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnColor}`}
                >
                    {dialog.confirmLabel || 'Confirm'}
                </button>
            </div>
        </dialog>
    );
};

CustomDialog.propTypes = {
    dialog: PropTypes.shape({
        isOpen: PropTypes.bool.isRequired,
        type: PropTypes.oneOf(['confirm', 'prompt']).isRequired,
        title: PropTypes.string.isRequired,
        icon: PropTypes.node,
        message: PropTypes.string,
        defaultValue: PropTypes.string,
        confirmLabel: PropTypes.string,
        confirmStyle: PropTypes.oneOf(['primary', 'danger']),
        onConfirm: PropTypes.func.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};
