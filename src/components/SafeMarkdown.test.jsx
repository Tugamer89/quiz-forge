import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SafeMarkdown from './SafeMarkdown';

describe('SafeMarkdown Component', () => {
  it('renders standard markdown headings correctly', () => {
    const markdown = '# Hello World\nThis is **bold** text';
    render(<SafeMarkdown>{markdown}</SafeMarkdown>);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
  });

  it('renders bold text correctly', () => {
    const markdown = 'This is **bold** text';
    render(<SafeMarkdown>{markdown}</SafeMarkdown>);

    const boldText = screen.getByText('bold');
    expect(boldText.tagName).toBe('STRONG');
  });

  it('blocks malicious script tags (XSS Prevention)', () => {
    const maliciousInput = 'Safe text <script>alert("Hacked!")</script>';
    const { container } = render(<SafeMarkdown>{maliciousInput}</SafeMarkdown>);

    expect(screen.getByText('Safe text')).toBeInTheDocument();
    const scriptTag = container.querySelector('script');
    expect(scriptTag).toBeNull();
  });

  it('strips dangerous event attributes', () => {
    const maliciousHtml = '<img src="x" onerror="alert(1)" alt="Hacker" />';
    const { container } = render(<SafeMarkdown>{maliciousHtml}</SafeMarkdown>);

    const elementWithOnError = container.querySelector('[onerror]');
    expect(elementWithOnError).toBeNull();
  });
});
