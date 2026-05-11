import { lazy, Suspense } from 'react';
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

export default function SafeMarkdown({
  children,
  remarkPlugins = [],
  rehypePlugins = [],
  ...rest
}) {
  const defaultRemark = [remarkGfm, remarkMath];
  const defaultRehype = [rehypeKatex, rehypeRaw];

  return (
    <ErrorBoundary>
      <Suspense fallback={<MarkdownPlaceholder />}>
        <SafeMarkdownCore
          {...rest}
          remarkPlugins={[...defaultRemark, ...remarkPlugins]}
          rehypePlugins={[...defaultRehype, ...rehypePlugins]}
        >
          {children}
        </SafeMarkdownCore>
      </Suspense>
    </ErrorBoundary>
  );
}

SafeMarkdown.propTypes = {
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  remarkPlugins: PropTypes.array,
  rehypePlugins: PropTypes.array,
};
