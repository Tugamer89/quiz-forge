import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

export default function SafeMarkdown({
  children,
  className,
  remarkPlugins,
  rehypePlugins,
  ...props
}) {
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const cleanContent = DOMPurify.sanitize(children, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'object'],
    FORBID_ATTR: ['onerror', 'onload', 'onmouseover'],
  });

  return (
    <div className={`prose dark:prose-invert max-w-none ${className || ''}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} {...props}>
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}

SafeMarkdown.propTypes = {
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  remarkPlugins: PropTypes.array,
  rehypePlugins: PropTypes.array,
};
