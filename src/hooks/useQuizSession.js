import { useState } from 'react';

export function useQuizSession(questions, setQuestions, settings, selectedDeckId, showToast) {
  const [quizSession, setQuizSession] = useState({
    active: false,
    isFinished: false,
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);

  const generateQuiz = () => {
    const eligible = questions.filter((q) => {
      if (q.deckId !== selectedDeckId) return false;

      if (settings.srsEnabled) {
        if (!q.nextReviewDate) return true;
        return new Date(q.nextReviewDate) <= new Date();
      }

      return (
        (q.status === 'unanswered' && settings.includeUnanswered) ||
        (q.status === 'correct' && settings.includeCorrect) ||
        (q.status === 'incorrect' && settings.includeIncorrect)
      );
    });

    if (!eligible.length) {
      return showToast(
        settings.srsEnabled
          ? 'You are all caught up for today! No reviews pending.'
          : 'No questions match filters!',
        'info'
      );
    }

    const shuffled = [...eligible].sort(() => 0.5 - Math.random()).slice(0, settings.numToGenerate);
    setQuizSession({
      active: true,
      isFinished: false,
      questions: shuffled,
      currentIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
    });
    setShowAnswer(false);
  };

  const handleAnswer = (isCorrect) => {
    const currentQ = quizSession.questions[quizSession.currentIndex];

    // Spaced Repetition
    let { easeFactor = 2.5, interval = 0, repetition = 0 } = currentQ;
    const quality = isCorrect ? 4 : 0;

    if (isCorrect) {
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
              status: isCorrect ? 'correct' : 'incorrect',
              interval,
              repetition,
              easeFactor,
              nextReviewDate: settings.srsEnabled ? nextReviewDate.toISOString() : null,
            }
          : item
      )
    );

    setQuizSession((prev) => {
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1),
        currentIndex: nextIndex,
        active: nextIndex < prev.questions.length,
        isFinished: nextIndex >= prev.questions.length,
      };
    });
    setShowAnswer(false);
  };

  const cancelSession = () => setQuizSession((p) => ({ ...p, active: false }));
  const resetSession = () => setQuizSession((p) => ({ ...p, isFinished: false, active: false }));
  const revealAnswer = () => setShowAnswer(true);

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
