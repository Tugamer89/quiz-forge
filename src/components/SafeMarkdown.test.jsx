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

        const heading = await screen.findByText('Hello World');
        expect(heading.tagName).toBe('H1');
    });

    it('renders bold text correctly after loading', async () => {
        const markdown = 'This is **bold** text';
        render(<SafeMarkdown>{markdown}</SafeMarkdown>);

        const boldText = await screen.findByText('bold');
        expect(boldText.tagName).toBe('STRONG');
    });

    it('blocks malicious script tags (XSS Prevention)', async () => {
        const maliciousInput = 'Safe text <script>alert("Hacked!")</script>';
        const { container } = render(<SafeMarkdown>{maliciousInput}</SafeMarkdown>);

        const safeText = await screen.findByText(/Safe text/);
        expect(safeText).toBeInTheDocument();

        const scriptTag = container.querySelector('script');
        expect(scriptTag).toBeNull();
    });

    it('strips dangerous event attributes', async () => {
        const maliciousHtml = '<img src="x" onerror="alert(1)" alt="Hacker" />';
        render(<SafeMarkdown>{maliciousHtml}</SafeMarkdown>);

        await waitFor(() => {
            const img = screen.getByAltText('Hacker');
            expect(img).toBeInTheDocument();
            expect(img).not.toHaveAttribute('onerror');
        });
    });
});
