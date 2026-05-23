import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import PropTypes from 'prop-types';
import CodeRenderer from './CodeRenderer';

export default function SafeMarkdownCore({ children, remarkPlugins, rehypePlugins, ...props }) {
    const sanitizeOptions = {
        ...defaultSchema,
        attributes: {
            ...defaultSchema.attributes,
            code: ['className', ...(defaultSchema.attributes.code || [])],
            span: ['className', 'style', ...(defaultSchema.attributes.span || [])],
        },
    };

    const combinedRehypePlugins = [...(rehypePlugins || []), [rehypeSanitize, sanitizeOptions]];

    const preRemoveWrapper = ({ children }) => <>{children}</>;

    const aRemoveWrapper = ({ href, ...rest }) => {
        if (href?.trim().toLowerCase().startsWith('javascript:')) {
            return <a target="_blank" rel="noopener noreferrer" {...rest} />;
        }
        return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
    };

    return (
        <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={combinedRehypePlugins}
            components={{
                code: CodeRenderer,
                pre: preRemoveWrapper,
                a: aRemoveWrapper,
            }}
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
