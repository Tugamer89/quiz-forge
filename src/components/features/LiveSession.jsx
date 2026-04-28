import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { Play, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { ProgressBar } from '../ProgressBar';

export const LiveSession = ({ session, onCancel, showAnswer, onReveal, onAnswer }) => {
  const currentQ = session.questions[session.currentIndex];
  const containerRef = useRef(null);
  const [tempAnswer, setTempAnswer] = useState('');

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, [session.currentIndex]);

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
          className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>

      <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-4">
        <div className="mb-6 prose prose-slate prose-indigo prose-lg dark:prose-invert max-w-none font-medium text-slate-900 dark:text-white leading-relaxed">
          <SafeMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {highlightTags(currentQ?.text)}
          </SafeMarkdown>
        </div>

        {showAnswer ? (
          <div className="mt-4 flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in duration-200">
            {tempAnswer.trim() && (
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Your Answer
                </h3>
                <div className="prose prose-slate prose-indigo dark:prose-invert max-w-none">
                  <SafeMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                  >
                    {highlightTags(tempAnswer)}
                  </SafeMarkdown>
                </div>
              </div>
            )}
            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">
                Correct Answer
              </h3>
              <div className="prose prose-slate prose-indigo prose-lg dark:prose-invert max-w-none">
                <SafeMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                >
                  {highlightTags(currentQ?.answer)}
                </SafeMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col space-y-4">
            <textarea
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all resize-y min-h-30"
              placeholder="Scrivi qui la tua risposta per confrontarla..."
              value={tempAnswer}
              onChange={(e) => setTempAnswer(e.target.value)}
            />
            <button
              onClick={onReveal}
              className="flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all font-medium text-lg w-full group"
            >
              <span>Reveal Answer</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
            </button>
          </div>
        )}
      </div>

      {showAnswer && (
        <div className="mt-6 flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => {
              setTempAnswer('');
              onAnswer(false);
            }}
            className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all active:scale-95"
          >
            <XCircle className="w-8 h-8 mb-2" />
            <span className="font-bold">Incorrect</span>
          </button>
          <button
            onClick={() => {
              setTempAnswer('');
              onAnswer(true);
            }}
            className="flex-1 flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl transition-all active:scale-95"
          >
            <CheckCircle2 className="w-8 h-8 mb-2" />
            <span className="font-bold">Correct</span>
          </button>
        </div>
      )}
    </div>
  );
};

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
