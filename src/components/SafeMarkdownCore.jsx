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
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
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
