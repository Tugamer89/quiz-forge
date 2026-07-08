import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react';
import { Play, ArrowRight, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';
import { ProgressBar } from '../ProgressBar';
import { useShortcuts } from '../../hooks/useShortcuts';

const highlightTags = (text) => {
    if (!text) return '';

    const parts = text.split(/(```[\s\S]*?```|`[^`]*`)/g);

    return parts
        .map((part) => {
            if (part.startsWith('`')) return part;

            return part.replaceAll(
                /(#\w+)/g,
                '<span class="text-indigo-500 dark:text-indigo-400 font-semibold">$1</span>'
            );
        })
        .join('');
};

export const LiveSession = memo(({ session, onCancel, showAnswer, onReveal, onAnswer }) => {
    const currentQ = session.questions[session.currentIndex];
    const containerRef = useRef(null);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [tempAnswer, setTempAnswer] = useState('');
    const [activeKey, setActiveKey] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    }, [session.currentIndex]);

    const handleActionWithFeedback = useCallback(
        (key, actionCallback) => {
            if (activeKey) return;
            setActiveKey(key);

            setTimeout(() => {
                setActiveKey(null);
                actionCallback();
            }, 250);
        },
        [activeKey]
    );

    useShortcuts({
        onFlip: () => {
            if (!showAnswer) handleActionWithFeedback('reveal', onReveal);
        },
        onGradeWrong: () => {
            if (showAnswer) {
                handleActionWithFeedback('wrong', () => {
                    handleGrade('incorrect');
                });
            }
        },
        onGradePartial: () => {
            if (showAnswer) {
                handleActionWithFeedback('partial', () => {
                    handleGrade('partially-correct');
                });
            }
        },
        onGradeCorrect: () => {
            if (showAnswer) {
                handleActionWithFeedback('correct', () => {
                    handleGrade('correct');
                });
            }
        },
        onExit: () => handleActionWithFeedback('cancel', onCancel),
    });

    const handleGrade = (grade) => {
        setTempAnswer('');
        onAnswer(grade);
    };

    const highlightedQuestionText = useMemo(() => highlightTags(currentQ?.text), [currentQ?.text]);
    const highlightedAnswerText = useMemo(
        () => highlightTags(currentQ?.answer),
        [currentQ?.answer]
    );

    return (
        <div
            ref={containerRef}
            className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-xl shadow-md border-2 border-indigo-200 dark:border-indigo-800/50 transition-colors animate-in fade-in duration-300 flex flex-col min-h-125"
        >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                    <Play className="w-5 h-5 text-indigo-500 mr-2" /> Live Session
                </h2>
                <button
                    onClick={onCancel}
                    className={`text-sm font-medium transition-colors ${
                        activeKey === 'cancel'
                            ? 'text-slate-600 dark:text-slate-200'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                    {`Cancel ${isMobile ? '' : '(Esc)'}`}
                </button>
            </div>

            <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-4">
                <div className="mb-6 prose prose-slate prose-indigo prose-lg dark:prose-invert max-w-none font-medium text-slate-900 dark:text-white leading-relaxed">
                    <SafeMarkdown>{highlightedQuestionText}</SafeMarkdown>
                </div>

                {showAnswer ? (
                    <div className="mt-4 flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in duration-200">
                        {tempAnswer.trim() && (
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                    Your Answer
                                </h3>
                                <div className="prose prose-slate prose-indigo dark:prose-invert max-w-none">
                                    <SafeMarkdown>{highlightTags(tempAnswer)}</SafeMarkdown>
                                </div>
                            </div>
                        )}
                        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">
                                Correct Answer
                            </h3>
                            <div className="prose prose-slate prose-indigo prose-lg dark:prose-invert max-w-none">
                                <SafeMarkdown>{highlightedAnswerText}</SafeMarkdown>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col space-y-4">
                        <textarea
                            aria-label="Your answer"
                            className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all resize-y min-h-30"
                            placeholder="Type your answer here to compare it..."
                            value={tempAnswer}
                            onChange={(e) => setTempAnswer(e.target.value)}
                        />
                        <button
                            onClick={onReveal}
                            className={`flex items-center justify-center space-x-2 py-4 border-2 border-dashed rounded-xl transition-all font-medium text-lg w-full group active:scale-95 ${
                                activeKey === 'reveal'
                                    ? 'scale-95 border-indigo-400 dark:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                            }`}
                        >
                            <span>{`Reveal Answer ${isMobile ? '' : '(Space)'}`}</span>
                            <ArrowRight
                                className={`w-5 h-5 transition-all ${activeKey === 'reveal' ? 'opacity-100 ml-0' : 'opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0'}`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {showAnswer && (
                <div className="mt-6 flex gap-2 md:gap-4 animate-in slide-in-from-bottom-4 duration-300">
                    <button
                        onClick={() => {
                            handleGrade('incorrect');
                        }}
                        className={`flex-1 flex flex-col items-center justify-center px-1 py-4 sm:p-4 border-2 border-red-200 dark:border-red-900/50 rounded-xl transition-all active:scale-95 text-red-600 dark:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-slate-800 ${
                            activeKey === 'wrong'
                                ? 'scale-95 bg-red-50 dark:bg-red-900/20'
                                : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title="Press '1' on keyboard"
                        aria-keyshortcuts="1"
                    >
                        <XCircle className="w-8 h-8 mb-2" />
                        <span className="font-bold">{`Incorrect ${isMobile ? '' : '(1)'}`}</span>
                    </button>

                    <button
                        onClick={() => {
                            handleGrade('partially-correct');
                        }}
                        className={`flex-1 flex flex-col items-center justify-center px-1 py-4 sm:p-4 border-2 border-amber-200 dark:border-amber-900/50 rounded-xl transition-all active:scale-95 text-amber-600 dark:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-800 ${
                            activeKey === 'partial'
                                ? 'scale-95 bg-amber-50 dark:bg-amber-900/20'
                                : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                        title="Press '2' on keyboard"
                        aria-keyshortcuts="2"
                    >
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <span className="font-bold">{`Partial ${isMobile ? '' : '(2)'}`}</span>
                    </button>

                    <button
                        onClick={() => {
                            handleGrade('correct');
                        }}
                        className={`flex-1 flex flex-col items-center justify-center px-1 py-4 sm:p-4 border-2 border-green-200 dark:border-green-900/50 rounded-xl transition-all active:scale-95 text-green-600 dark:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 dark:focus-visible:ring-offset-slate-800 ${
                            activeKey === 'correct'
                                ? 'scale-95 bg-green-50 dark:bg-green-900/20'
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title="Press '3' on keyboard"
                        aria-keyshortcuts="3"
                    >
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <span className="font-bold">{`Correct ${isMobile ? '' : '(3)'}`}</span>
                    </button>
                </div>
            )}
        </div>
    );
});

LiveSession.propTypes = {
    session: PropTypes.shape({
        questions: PropTypes.array.isRequired,
        currentIndex: PropTypes.number.isRequired,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    showAnswer: PropTypes.bool.isRequired,
    onReveal: PropTypes.func.isRequired,
    onAnswer: PropTypes.func.isRequired,
};
