import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const getLocalYYYYMMDD = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const dateLocal = new Date(date.getTime() - offset * 60 * 1000);
    return dateLocal.toISOString().split('T')[0];
};

export function useActivityLog() {
    const [activityLog, setActivityLog] = useLocalStorage('quiz_activity_log', {});

    const logStudyActivity = useCallback(
        (deckId, count = 1) => {
            if (!deckId) return;
            const today = getLocalYYYYMMDD();

            setActivityLog((prev) => {
                const deckLog = prev[deckId] || {};
                return {
                    ...prev,
                    [deckId]: {
                        ...deckLog,
                        [today]: (deckLog[today] || 0) + count,
                    },
                };
            });
        },
        [setActivityLog]
    );

    return { activityLog, logStudyActivity };
}
