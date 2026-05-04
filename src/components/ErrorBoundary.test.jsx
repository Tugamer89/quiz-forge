import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ProblematicComponent = () => {
  throw new Error('Intentional crash for testing purposes');
};

describe('ErrorBoundary Component', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children correctly when there are no errors', () => {
    render(
      <ErrorBoundary>
        <div>Secure Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Secure Content')).toBeInTheDocument();
  });

  it('renders the fallback UI when a child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Markdown Rendering Error/i)).toBeInTheDocument();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Markdown Rendering Error:'),
      expect.anything(),
      expect.anything()
    );
  });
});
