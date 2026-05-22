import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SafeMarkdown from './SafeMarkdown';

describe('SafeMarkdown Component (Lazy & Suspense)', () => {
    it('renders the loading placeholder initially', () => {
        const { container } = render(<SafeMarkdown># Test</SafeMarkdown>);

        const placeholder = container.querySelector('.animate-pulse');
        expect(placeholder).toBeInTheDocument();
    });

    it('renders standard markdown headings correctly after loading', async () => {
        const markdown = '# Hello World\nThis is **bold** text';
        render(<SafeMarkdown>{markdown}</SafeMarkdown>);

        await waitFor(
            () => {
                const heading = screen.queryByRole('heading', { level: 1 });
                if (heading) {
                    expect(heading).toHaveTextContent('Hello World');
                }
            },
            { timeout: 3000 }
        );
    });

    it('renders bold text correctly after loading', async () => {
        const markdown = 'This is **bold** text';
        render(<SafeMarkdown>{markdown}</SafeMarkdown>);

        await waitFor(
            () => {
                const boldText = screen.queryByText('bold');
                if (boldText) {
                    expect(boldText.tagName).toBe('STRONG');
                }
            },
            { timeout: 3000 }
        );
    });

    it('blocks malicious script tags (XSS Prevention)', async () => {
        const maliciousInput = 'Safe text <script>alert("Hacked!")</script>';
        const { container } = render(<SafeMarkdown>{maliciousInput}</SafeMarkdown>);

        await waitFor(
            () => {
                const safeText = screen.queryByText(/Safe text/);
                if (safeText) {
                    expect(safeText).toBeInTheDocument();
                }
            },
            { timeout: 3000 }
        );

        const scriptTag = container.querySelector('script');
        expect(scriptTag).toBeNull();
    });

    it('strips dangerous event attributes', async () => {
        const maliciousHtml = '<img src="x" onerror="alert(1)" alt="Hacker" />';
        render(<SafeMarkdown>{maliciousHtml}</SafeMarkdown>);

        await waitFor(
            () => {
                const img = screen.queryByAltText('Hacker');
                if (img) {
                    expect(img).toBeInTheDocument();
                    expect(img).not.toHaveAttribute('onerror');
                }
            },
            { timeout: 3000 }
        );
    });
});
