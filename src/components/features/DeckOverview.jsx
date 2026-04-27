import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BookOpen,
  Folder,
  Circle,
  CheckCircle2,
  XCircle,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

export const DeckOverview = ({ questions, stats, onMarkQuestion }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const allTags = useMemo(() => {
    const tags = new Set();
    questions.forEach((q) => q.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [questions, searchTerm, selectedTag]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex flex-col h-full min-h-125">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
          <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
          Deck Overview
        </h2>
        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold px-3 py-1 rounded-full">
          {stats.total} Total
        </span>
      </div>

      {questions.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedTag === null
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs font-medium flex items-center rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8">
          <Folder className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-center">
            This deck is empty.
            <br />
            Add questions in the raw text box.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar h-full">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="flex flex-col p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl group transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  className="flex-1 min-w-0 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg p-1 -m-1"
                >
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    {expandedId === q.id ? (
                      <ChevronUp className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                    )}
                    <span className="truncate">
                      <span className="text-indigo-400 mr-1 font-mono text-xs">{q.number}.</span>{' '}
                      {q.text}
                    </span>
                  </div>
                  {q.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 ml-6">
                      {q.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] flex items-center px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                <div className="flex items-center space-x-1 shrink-0 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                  <button
                    type="button"
                    onClick={() => onMarkQuestion(q.id, 'unanswered')}
                    className={`p-2 rounded-md transition-colors ${q.status === 'unanswered' ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="Mark as unanswered"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkQuestion(q.id, 'correct')}
                    className={`p-2 rounded-md transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                    title="Mark as correct"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkQuestion(q.id, 'incorrect')}
                    className={`p-2 rounded-md transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                    title="Mark as incorrect"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedId === q.id && (
                <div className="mt-3 ml-6 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:text-slate-800 dark:prose-pre:text-slate-200 text-slate-600 dark:text-slate-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
                    >
                      {q.answer || '*No text answers found for this question.*'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center text-slate-500 py-8 text-sm">
              No questions match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

DeckOverview.propTypes = {
  questions: PropTypes.array.isRequired,
  stats: PropTypes.object.isRequired,
  onMarkQuestion: PropTypes.func.isRequired,
};
