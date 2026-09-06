import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SafeMarkdownCore from './SafeMarkdownCore';
import rehypeRaw from 'rehype-raw';

describe('SafeMarkdown Component', () => {
    it('renders standard markdown headings correctly', () => {
        const markdown = '# Hello World\nThis is **bold** text';
        render(<SafeMarkdownCore>{markdown}</SafeMarkdownCore>);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
    });

    it('renders bold text correctly', () => {
        const markdown = 'This is **bold** text';
        render(<SafeMarkdownCore>{markdown}</SafeMarkdownCore>);

        const boldText = screen.getByText('bold');
        expect(boldText.tagName).toBe('STRONG');
    });

    it('blocks malicious script tags (XSS Prevention)', () => {
        const maliciousInput = 'Safe text <script>alert("Hacked!")</script>';
        const { container } = render(
            <SafeMarkdownCore rehypePlugins={[rehypeRaw]}>{maliciousInput}</SafeMarkdownCore>
        );

        expect(screen.getByText(/Safe text/)).toBeInTheDocument();
        const scriptTag = container.querySelector('script');
        expect(scriptTag).toBeNull();
    });

    it('strips dangerous event attributes', () => {
        const maliciousHtml = '<img src="x" onerror="alert(1)" alt="Hacker" />';
        const { container } = render(
            <SafeMarkdownCore rehypePlugins={[rehypeRaw]}>{maliciousHtml}</SafeMarkdownCore>
        );

        const elementWithOnError = container.querySelector('[onerror]');
        expect(elementWithOnError).toBeNull();
    });

    it.each([
        ['javascript in markdown link', '[Click me](javascript:alert("XSS"))'],
        ['javascript in raw html link', '<a href="javascript:alert(\'XSS\')">Click me</a>'],
        [
            'javascript with whitespace in raw html',
            '<a href="  \t javascript:alert(\'XSS\')">Click me</a>',
        ],
        ['vbscript protocol', '[Click me](vbscript:alert(1))'],
    ])('blocks malicious href: %s (Defense-in-Depth XSS Prevention)', (_, maliciousInput) => {
        const { container } = render(
            <SafeMarkdownCore rehypePlugins={[rehypeRaw]}>{maliciousInput}</SafeMarkdownCore>
        );

        const aTag = container.querySelector('a');
        expect(aTag).toBeInTheDocument();
        // The sanitize should remove the href completely or leave it empty, blocking the malicious protocol
        expect(aTag.getAttribute('href')).toBeNull();
    });
});
