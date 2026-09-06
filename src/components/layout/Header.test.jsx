import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './Header';

// Mock CloudSync component
vi.mock('../features/CloudSync', () => ({
    CloudSync: () => <div data-testid="cloud-sync-mock">CloudSync</div>,
}));

describe('Header Component', () => {
    const defaultProps = {
        decks: [],
        questions: [],
        rawTexts: {},
        setDecks: vi.fn(),
        setQuestions: vi.fn(),
        setRawTexts: vi.fn(),
        showToast: vi.fn(),
        deferredPrompt: null,
        onInstall: vi.fn(),
        onImport: vi.fn(),
        onExport: vi.fn(),
        isDarkMode: false,
        toggleTheme: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the brand name and main buttons correctly', () => {
        render(<Header {...defaultProps} />);

        expect(screen.getByText('Quiz Forge')).toBeInTheDocument();
        expect(screen.getByText('Data & Sync')).toBeInTheDocument();

        // Install app button should not be present when deferredPrompt is null
        expect(screen.queryByText('Install App')).not.toBeInTheDocument();
    });

    it('renders the Install App button when deferredPrompt is provided', () => {
        render(<Header {...defaultProps} deferredPrompt={{}} />);

        const installBtn = screen.getByText('Install App');
        expect(installBtn).toBeInTheDocument();

        fireEvent.click(installBtn);
        expect(defaultProps.onInstall).toHaveBeenCalledTimes(1);
    });

    it('toggles theme correctly', () => {
        const { rerender } = render(<Header {...defaultProps} />);

        const toggleBtn = screen.getByRole('button', { name: /Switch to Dark Theme/i });
        expect(toggleBtn).toBeInTheDocument();

        fireEvent.click(toggleBtn);
        expect(defaultProps.toggleTheme).toHaveBeenCalledTimes(1);

        // Re-render with dark mode true to check label update
        rerender(<Header {...defaultProps} isDarkMode={true} />);
        expect(screen.getByRole('button', { name: /Switch to Light Theme/i })).toBeInTheDocument();
    });

    it('toggles the Data & Sync menu when clicked', () => {
        render(<Header {...defaultProps} />);

        const menuBtn = screen.getByText('Data & Sync');

        // Menu closed initially
        expect(screen.queryByText('Local Storage')).not.toBeInTheDocument();

        // Open menu
        fireEvent.click(menuBtn);
        expect(screen.getByText('Local Storage')).toBeInTheDocument();
        expect(screen.getByText('Cloud Sync')).toBeInTheDocument();
        expect(screen.getByTestId('cloud-sync-mock')).toBeInTheDocument();

        // Close menu
        fireEvent.click(menuBtn);
        expect(screen.queryByText('Local Storage')).not.toBeInTheDocument();
    });

    it('closes the Data & Sync menu when clicking outside', () => {
        render(
            <div>
                <div data-testid="outside">Outside Element</div>
                <Header {...defaultProps} />
            </div>
        );

        const menuBtn = screen.getByText('Data & Sync');

        // Open menu
        fireEvent.click(menuBtn);
        expect(screen.getByText('Local Storage')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside'));

        // Menu should be closed
        expect(screen.queryByText('Local Storage')).not.toBeInTheDocument();
    });

    it('handles export backup correctly', () => {
        render(<Header {...defaultProps} />);

        // Open menu
        fireEvent.click(screen.getByText('Data & Sync'));

        const exportBtn = screen.getByText('Export Backup');
        fireEvent.click(exportBtn);

        expect(defaultProps.onExport).toHaveBeenCalledTimes(1);

        // Menu should close after export
        expect(screen.queryByText('Export Backup')).not.toBeInTheDocument();
    });

    it('handles import backup correctly', () => {
        render(<Header {...defaultProps} />);

        // Open menu
        fireEvent.click(screen.getByText('Data & Sync'));

        const fileInput = screen.getByLabelText('Import backup file');

        // Simulate file selection
        const file = new File(['{"dummy": "data"}'], 'backup.json', { type: 'application/json' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(defaultProps.onImport).toHaveBeenCalledTimes(1);
        // We can check that the event was passed correctly
        expect(defaultProps.onImport.mock.calls[0][0].target.files[0]).toBe(file);

        // Menu should close after import
        expect(screen.queryByText('Local Storage')).not.toBeInTheDocument();
    });
});
