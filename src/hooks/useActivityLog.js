import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getLocalYYYYMMDD } from '../utils/helpers';

export function useActivityLog() {
    const [activityLog, setActivityLog] = useLocalStorage('quiz_activity_log', {});

    const logStudyActivity = useCallback(
        (deckId, count = 1) => {
            if (!deckId) return;
            const today = getLocalYYYYMMDD();
            if (!today) return;

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
