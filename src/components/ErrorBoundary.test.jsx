import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react', () => ({
    captureException: vi.fn(() => 'fake-event-id-123'),
    showReportDialog: vi.fn(),
}));

const ProblematicComponent = () => {
    throw new Error('Intentional crash for testing purposes');
};

describe('ErrorBoundary Component', () => {
    const originalConsoleError = console.error;
    const originalReportError = globalThis.reportError;

    beforeEach(() => {
        console.error = vi.fn();

        if (typeof globalThis !== 'undefined') {
            globalThis.reportError = vi.fn();
        }

        vi.clearAllMocks();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        if (typeof globalThis !== 'undefined') {
            globalThis.reportError = originalReportError;
        }
    });

    it('renders children correctly when there are no errors', () => {
        render(
            <ErrorBoundary>
                <div>Secure Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Secure Content')).toBeInTheDocument();
    });

    it('renders fallback UI and calls Sentry when a child throws an error', () => {
        render(
            <ErrorBoundary>
                <ProblematicComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Rendering error/i)).toBeInTheDocument();

        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        expect(Sentry.captureException).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({ contexts: expect.any(Object) })
        );
    });

    it('opens the Sentry report dialog when the Report Issue button is clicked', () => {
        render(
            <ErrorBoundary>
                <ProblematicComponent />
            </ErrorBoundary>
        );

        const reportButton = screen.getByRole('button', { name: /Report Issue/i });
        fireEvent.click(reportButton);

        expect(Sentry.showReportDialog).toHaveBeenCalledTimes(1);
        expect(Sentry.showReportDialog).toHaveBeenCalledWith({ eventId: 'fake-event-id-123' });
    });
});
