import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CodeRenderer from './CodeRenderer';

describe('CodeRenderer Component', () => {
  it('renders inline code correctly when no language class is provided', () => {
    const code = 'const a = 1;';
    render(<CodeRenderer>{code}</CodeRenderer>);

    const codeElement = screen.getByText(code);
    expect(codeElement.tagName).toBe('CODE');

    expect(codeElement).toHaveClass('bg-slate-100');
    expect(codeElement).toHaveClass('text-indigo-600');
    expect(codeElement).toHaveClass('font-mono');
  });

  it('renders SyntaxHighlighter block when a language class is provided', () => {
    const code = "print('test')";

    const { container } = render(<CodeRenderer className="language-python">{code}</CodeRenderer>);

    expect(container).toHaveTextContent("print('test')");

    const wrapperDiv = container.querySelector('.my-4.rounded-xl.overflow-hidden');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('spreads additional props to the inline code element', () => {
    render(
      <CodeRenderer data-testid="inline-code" id="custom-id">
        let x = 10;
      </CodeRenderer>
    );

    const codeElement = screen.getByTestId('inline-code');
    expect(codeElement).toBeInTheDocument();

    expect(codeElement).toHaveAttribute('id', 'custom-id');
  });

  it('handles the inline prop correctly to force inline rendering', () => {
    render(
      <CodeRenderer inline={true} className="language-javascript">
        console.log('inline')
      </CodeRenderer>
    );

    const codeElement = screen.getByText("console.log('inline')");
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement.className).toContain('language-javascript');
    expect(codeElement.className).toContain('bg-slate-100');
  });
});
