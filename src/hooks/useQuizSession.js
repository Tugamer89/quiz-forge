import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/react';

export function useQuizSession(
    questions,
    setQuestions,
    settings,
    selectedDeckId,
    showToast,
    logActivity
) {
    const [quizSession, setQuizSession] = useState({
        active: false,
        isFinished: false,
        questions: [],
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        partiallyCorrectCount: 0,
        lastOptions: {},
    });
    const [showAnswer, setShowAnswer] = useState(false);

    const generateQuiz = useCallback((options = {}) => {
        const isMouseEvent = options && options.nativeEvent instanceof Event;
        const opts = isMouseEvent ? {} : options || {};
        const { includedTags = [], excludedTags = [] } = opts;

        const includedSet = new Set(includedTags);
        const excludedSet = new Set(excludedTags);

        const nowTime = Date.now();

        const eligible = questions.filter((q) => {
            if (q.deckId !== selectedDeckId) return false;

            if (includedSet.size > 0) {
                const hasAnyIncluded = q.tags?.some((t) => includedSet.has(t));
                if (!hasAnyIncluded) return false;
            }

            if (excludedSet.size > 0) {
                const hasAnyExcluded = q.tags?.some((t) => excludedSet.has(t));
                if (hasAnyExcluded) return false;
            }

            if (settings.srsEnabled) {
                if (!q.nextReviewDate) return true;
                return new Date(q.nextReviewDate).getTime() <= nowTime;
            }

            return (
                (q.status === 'unanswered' && settings.includeUnanswered) ||
                (q.status === 'correct' && settings.includeCorrect) ||
                (q.status === 'incorrect' && settings.includeIncorrect) ||
                (q.status === 'partially-correct' && settings.includePartiallyCorrect)
            );
        });

        Sentry.addBreadcrumb({
            category: 'quiz_generation',
            message: `Started quiz with ${settings.numToGenerate} questions. SRS: ${settings.srsEnabled}`,
            level: 'info',
        });

        if (!eligible.length) {
            return showToast(
                settings.srsEnabled
                    ? 'You are all caught up for today! No reviews pending.'
                    : 'No questions match filters!',
                'info'
            );
        }

        const shuffled = [...eligible];
        const numItems = Math.min(settings.numToGenerate, shuffled.length);

        // Partial Fisher-Yates shuffle: O(N)
        for (let i = 0; i < numItems; i++) {
            const randomIndex = i + Math.floor(Math.random() * (shuffled.length - i)); // NOSONAR
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }
        const selected = shuffled.slice(0, numItems);

        setQuizSession({
            active: true,
            isFinished: false,
            questions: selected,
            currentIndex: 0,
            correctCount: 0,
            incorrectCount: 0,
            partiallyCorrectCount: 0,
            lastOptions: opts,
        });
        setShowAnswer(false);
    }, [questions, selectedDeckId, settings, showToast]);

    const handleAnswer = useCallback((answerStatus) => {
        const currentQ = quizSession.questions[quizSession.currentIndex];

        // Spaced Repetition
        let { easeFactor = 2.5, interval = 0, repetition = 0 } = currentQ;

        // Treat 'partially-correct' as incorrect (0) for SRS algorithm purposes
        const isStrictlyCorrect = answerStatus === 'correct';
        const quality = isStrictlyCorrect ? 4 : 0;

        if (isStrictlyCorrect) {
            if (repetition === 0) interval = 1;
            else if (repetition === 1) interval = 6;
            else interval = Math.round(interval * easeFactor);
            repetition += 1;
        } else {
            repetition = 0;
            interval = 1;
        }

        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        setQuestions((prev) =>
            prev.map((item) =>
                item.id === currentQ.id
                    ? {
                          ...item,
                          status: answerStatus,
                          interval,
                          repetition,
                          easeFactor,
                          nextReviewDate: settings.srsEnabled ? nextReviewDate.toISOString() : null,
                      }
                    : item
            )
        );

        if (logActivity) {
            logActivity(selectedDeckId, 1);
        }

        setQuizSession((prev) => {
            const nextIndex = prev.currentIndex + 1;
            return {
                ...prev,
                correctCount: prev.correctCount + (answerStatus === 'correct' ? 1 : 0),
                incorrectCount: prev.incorrectCount + (answerStatus === 'incorrect' ? 1 : 0),
                partiallyCorrectCount:
                    prev.partiallyCorrectCount + (answerStatus === 'partially-correct' ? 1 : 0),
                currentIndex: nextIndex,
                active: nextIndex < prev.questions.length,
                isFinished: nextIndex >= prev.questions.length,
            };
        });
        setShowAnswer(false);
    }, [quizSession.questions, quizSession.currentIndex, settings.srsEnabled, selectedDeckId, logActivity, setQuestions]);

    const cancelSession = useCallback(() => setQuizSession((p) => ({ ...p, active: false })), []);
    const resetSession = useCallback(
        () => setQuizSession((p) => ({ ...p, isFinished: false, active: false })),
        []
    );
    const revealAnswer = useCallback(() => setShowAnswer(true), []);

    return {
        quizSession,
        showAnswer,
        generateQuiz,
        handleAnswer,
        cancelSession,
        resetSession,
        revealAnswer,
    };
}
