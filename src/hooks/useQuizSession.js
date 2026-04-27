import { useState } from 'react';
import { setQuestionStatus } from '../utils/helpers';

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
    const eligible = questions.filter(
      (q) =>
        q.deckId === selectedDeckId &&
        ((q.status === 'unanswered' && settings.includeUnanswered) ||
          (q.status === 'correct' && settings.includeCorrect) ||
          (q.status === 'incorrect' && settings.includeIncorrect))
    );

    if (!eligible.length) return showToast('No questions match filters!', 'error');

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
    setQuestions(setQuestionStatus(currentQ.id, isCorrect ? 'correct' : 'incorrect'));

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
