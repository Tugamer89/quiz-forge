import { useState, useEffect } from 'react';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';

export default function CodeRenderer({ inline, className, children, ...rest }) {
    const [isDark, setIsDark] = useState(() => {
        try {
            const localTheme = globalThis.localStorage.getItem('quiz_theme_dark');
            if (localTheme !== null) {
                return JSON.parse(localTheme);
            }
        } catch (e) {
            console.error(e);
        }
        return document?.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const root = document.documentElement;

        const checkTheme = () => {
            setIsDark(root.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

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
