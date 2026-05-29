import { lazy, Suspense, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from './ErrorBoundary';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

const SafeMarkdownCore = lazy(() => import('./SafeMarkdownCore'));

const MarkdownPlaceholder = () => (
    <div className="h-4 w-full max-w-50 bg-slate-100 dark:bg-slate-700 animate-pulse rounded mt-1" />
);

const defaultRemark = [remarkGfm, remarkMath];
const defaultRehype = [rehypeKatex, rehypeRaw];
const EMPTY_ARRAY = [];

const SafeMarkdown = memo(function SafeMarkdown({
    children,
    remarkPlugins = EMPTY_ARRAY,
    rehypePlugins = EMPTY_ARRAY,
    ...rest
}) {
    // Memoize the combined plugins to prevent unnecessary re-renders of the heavy markdown core
    const combinedRemark = useMemo(() => [...defaultRemark, ...remarkPlugins], [remarkPlugins]);
    const combinedRehype = useMemo(() => [...defaultRehype, ...rehypePlugins], [rehypePlugins]);

    return (
        <ErrorBoundary>
            <Suspense fallback={<MarkdownPlaceholder />}>
                <SafeMarkdownCore
                    {...rest}
                    remarkPlugins={combinedRemark}
                    rehypePlugins={combinedRehype}
                >
                    {children}
                </SafeMarkdownCore>
            </Suspense>
        </ErrorBoundary>
    );
});

SafeMarkdown.propTypes = {
    children: PropTypes.string.isRequired,
    className: PropTypes.string,
    remarkPlugins: PropTypes.array,
    rehypePlugins: PropTypes.array,
};

export default SafeMarkdown;
