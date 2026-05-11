import { useEffect } from 'react';

export const useShortcuts = ({ onFlip, onGradeWrong, onGradePartial, onGradeCorrect, onExit }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (event.repeat) return;

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          onFlip?.();
          break;
        case '1':
          onGradeWrong?.();
          break;
        case '2':
          onGradePartial?.();
          break;
        case '3':
          onGradeCorrect?.();
          break;
        case 'Escape':
          onExit?.();
          break;
        default:
          break;
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFlip, onGradeWrong, onGradePartial, onGradeCorrect, onExit]);
};
