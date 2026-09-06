import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import PropTypes from 'prop-types';
import CodeRenderer from './CodeRenderer';

const sanitizeOptions = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        code: ['className', ...(defaultSchema.attributes.code || [])],
        span: ['className', 'style', ...(defaultSchema.attributes.span || [])],
    },
    protocols: {
        ...defaultSchema.protocols,
        href: ['http', 'https', 'mailto', 'tel'],
        src: ['http', 'https'],
        cite: ['http', 'https'],
    },
};

const preRemoveWrapper = ({ children }) => <>{children}</>;

const aRemoveWrapper = ({ href, ...rest }) => {
    // Defense-in-depth: Ensure malicious protocols are blocked even if sanitization fails
    let safeHref = href;
    if (href && typeof href === 'string') {
        const sanitizedHref = href.replace(
            // eslint-disable-next-line no-control-regex
            /[\x00-\x20\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g,
            ''
        );
        if (/^(javascript|vbscript|data):/i.test(sanitizedHref)) {
            safeHref = undefined;
        }
    }

    return <a href={safeHref} target="_blank" rel="noopener noreferrer" {...rest} />;
};

const markdownComponents = {
    code: CodeRenderer,
    pre: preRemoveWrapper,
    a: aRemoveWrapper,
};

export default function SafeMarkdownCore({ children, remarkPlugins, rehypePlugins, ...props }) {
    const combinedRehypePlugins = useMemo(
        () => [...(rehypePlugins || []), [rehypeSanitize, sanitizeOptions]],
        [rehypePlugins]
    );

    return (
        <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={combinedRehypePlugins}
            components={markdownComponents}
            {...props}
        >
            {children}
        </ReactMarkdown>
    );
}

SafeMarkdownCore.propTypes = {
    children: PropTypes.string.isRequired,
    className: PropTypes.string,
    remarkPlugins: PropTypes.array,
    rehypePlugins: PropTypes.array,
};
