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
    AlertCircle,
    Play,
} from 'lucide-react';
import SafeMarkdown from '../SafeMarkdown';

export const DeckOverview = ({ questions, stats, onMarkQuestion, onStartCustomSession }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [includedTags, setIncludedTags] = useState([]);
    const [excludedTags, setExcludedTags] = useState([]);
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

            const matchesIncluded =
                includedTags.length === 0 || includedTags.every((t) => q.tags?.includes(t));
            const matchesExcluded =
                excludedTags.length === 0 || !excludedTags.some((t) => q.tags?.includes(t));

            return matchesSearch && matchesIncluded && matchesExcluded;
        });
    }, [questions, searchTerm, includedTags, excludedTags]);

    const toggleTag = (tag) => {
        if (tag === null) {
            setIncludedTags([]);
            setExcludedTags([]);
        } else {
            const isIncluded = includedTags.includes(tag);
            const isExcluded = excludedTags.includes(tag);

            if (isIncluded) {
                setIncludedTags((prev) => prev.filter((t) => t !== tag));
                setExcludedTags((prev) => [...prev, tag]);
            } else if (isExcluded) {
                setExcludedTags((prev) => prev.filter((t) => t !== tag));
            } else {
                setIncludedTags((prev) => [...prev, tag]);
            }
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const isCustomSessionActive = includedTags.length > 0 || excludedTags.length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex flex-col h-full min-h-125">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
                    <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                    Deck Overview
                </h2>
                <div className="flex space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    <span>
                        Total:{' '}
                        <span className="text-slate-700 dark:text-slate-200 font-bold">
                            {stats.total}
                        </span>
                    </span>
                </div>
            </div>

            {questions.length > 0 && (
                <div className="mb-4 space-y-3">
                    <div className="flex gap-3 mb-2 flex-col md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                aria-label="Search questions"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white"
                            />
                        </div>
                        {isCustomSessionActive && (
                            <button
                                onClick={() => onStartCustomSession({ includedTags, excludedTags })}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm text-sm"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Start Custom Quiz</span>
                            </button>
                        )}
                    </div>

                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                onClick={() => toggleTag(null)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                    !isCustomSessionActive
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                All
                            </button>
                            {allTags.map((tag) => {
                                const isIncluded = includedTags.includes(tag);
                                const isExcluded = excludedTags.includes(tag);

                                let tagStyle =
                                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600';
                                if (isIncluded) {
                                    tagStyle = 'bg-indigo-500 text-white';
                                } else if (isExcluded) {
                                    tagStyle = 'bg-red-500 text-white line-through';
                                }

                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 text-xs font-medium flex items-center rounded-full transition-colors ${tagStyle}`}
                                        title={
                                            isIncluded
                                                ? 'Included'
                                                : isExcluded
                                                  ? 'Excluded'
                                                  : 'Unselected'
                                        }
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {questions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8">
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
                                    title="Expand question to see answer"
                                    aria-expanded={expandedId === q.id}
                                    onClick={() => toggleExpand(q.id)}
                                    className="flex-1 min-w-0 text-left focus:outline-none rounded-lg p-1 -m-1"
                                >
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2 overflow-hidden">
                                        {expandedId === q.id ? (
                                            <ChevronUp className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                                        )}
                                        <div className="flex-1 min-w-0 flex items-baseline">
                                            <span className="text-indigo-500 dark:text-indigo-400 mr-2 font-mono text-xs shrink-0">
                                                {q.number}.
                                            </span>
                                            <div className="truncate prose prose-sm dark:prose-invert max-w-none prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:text-slate-800 dark:prose-pre:text-slate-200 [&>p]:m-0 [&>p]:inline [&_h1]:m-0 [&_h1]:text-sm [&_h1]:inline [&_h2]:m-0 [&_h2]:text-sm [&_h2]:inline [&_h3]:m-0 [&_h3]:text-sm [&_h3]:inline [&_ul]:m-0 [&_ul]:inline [&_li]:m-0 [&_li]:inline [&_li]:list-none">
                                                <SafeMarkdown>{q.text}</SafeMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                    {q.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2 ml-6">
                                            {q.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] font-medium flex items-center px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
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
                                        aria-label="Mark as unanswered"
                                    >
                                        <Circle className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarkQuestion(q.id, 'correct')}
                                        className={`p-2 rounded-md transition-colors ${q.status === 'correct' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                        title="Mark as correct"
                                        aria-label="Mark as correct"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarkQuestion(q.id, 'partially-correct')}
                                        className={`p-2 rounded-md transition-colors ${q.status === 'partially-correct' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                        title="Mark as partially correct"
                                        aria-label="Mark as partially correct"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarkQuestion(q.id, 'incorrect')}
                                        className={`p-2 rounded-md transition-colors ${q.status === 'incorrect' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                        title="Mark as incorrect"
                                        aria-label="Mark as incorrect"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {expandedId === q.id && (
                                <div className="mt-3 ml-6 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:text-slate-800 dark:prose-pre:text-slate-200 text-slate-600 dark:text-slate-300">
                                        <SafeMarkdown>
                                            {q.answer ||
                                                '*No text answers found for this question.*'}
                                        </SafeMarkdown>
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
    onStartCustomSession: PropTypes.func,
};
