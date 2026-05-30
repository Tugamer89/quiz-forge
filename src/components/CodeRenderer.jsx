import { useState, useEffect } from 'react';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';

// perf: Cache initial theme and use shared observer to prevent memory leaks and redundant operations
let cachedInitialTheme = null;
let sharedObserver = null;
const subscribers = new Set();

const getInitialTheme = () => {
    if (cachedInitialTheme !== null) return cachedInitialTheme;
    try {
        const localTheme = globalThis.localStorage.getItem('quiz_theme_dark');
        if (localTheme !== null) {
            cachedInitialTheme = JSON.parse(localTheme);
            return cachedInitialTheme;
        }
    } catch (e) {
        console.error(e);
    }
    cachedInitialTheme = document?.documentElement.classList.contains('dark');
    return cachedInitialTheme;
};

const notifySubscribers = (isDark) => {
    cachedInitialTheme = isDark;
    subscribers.forEach((cb) => cb(isDark));
};

const setupSharedObserver = () => {
    if (sharedObserver) return;
    const root = document.documentElement;
    sharedObserver = new MutationObserver(() => {
        notifySubscribers(root.classList.contains('dark'));
    });
    sharedObserver.observe(root, {
        attributes: true,
        attributeFilter: ['class'],
    });
};

export default function CodeRenderer({ inline, className, children, ...rest }) {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        // perf: Skip observing theme changes for inline code block since it relies on CSS classes
        if (inline) return;

        setupSharedObserver();

        const handleThemeChange = (dark) => setIsDark(dark);
        subscribers.add(handleThemeChange);

        return () => {
            subscribers.delete(handleThemeChange);
        };
    }, [inline]);

    const match = /language-(\w+)/.exec(className || '');

    return !inline && match ? (
        <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <SyntaxHighlighter
                {...rest}
                style={isDark ? vscDarkPlus : vs}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1rem', fontSize: '0.8rem' }}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code
            {...rest}
            className={`${className || ''} bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md text-sm font-mono`}
        >
            {children}
        </code>
    );
}

CodeRenderer.propTypes = {
    inline: PropTypes.bool.isRequired,
    className: PropTypes.string,
    children: PropTypes.string.isRequired,
};
