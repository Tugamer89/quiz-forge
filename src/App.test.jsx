import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock child components to isolate App testing
vi.mock('./components/CustomDialog', () => ({
    CustomDialog: () => <div data-testid="mock-custom-dialog">Dialog</div>,
}));
vi.mock('./components/Toast', () => ({
    Toast: () => <div data-testid="mock-toast">Toast</div>,
}));
vi.mock('./components/layout/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>,
}));
vi.mock('./components/layout/Footer', () => ({
    Footer: () => <div data-testid="mock-footer">Footer</div>,
}));
vi.mock('./components/features/SidebarControls', () => ({
    SidebarControls: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));
vi.mock('./components/features/LiveSession', () => ({
    LiveSession: () => <div data-testid="mock-live-session">Live Session</div>,
}));
vi.mock('./components/SummaryScreen', () => ({
    SummaryScreen: () => <div data-testid="mock-summary-screen">Summary Screen</div>,
}));
vi.mock('./components/features/DeckOverview', () => ({
    DeckOverview: () => <div data-testid="mock-deck-overview">Deck Overview</div>,
}));

// Mock hooks
vi.mock('./hooks/useAppUI', () => ({
    useAppUI: vi.fn(),
}));
vi.mock('./hooks/useQuizData', () => ({
    useQuizData: vi.fn(),
}));
vi.mock('./hooks/useQuizSession', () => ({
    useQuizSession: vi.fn(),
}));
vi.mock('./hooks/useActivityLog', () => ({
    useActivityLog: vi.fn(),
}));

import { useAppUI } from './hooks/useAppUI';
import { useQuizData } from './hooks/useQuizData';
import { useQuizSession } from './hooks/useQuizSession';
import { useActivityLog } from './hooks/useActivityLog';

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default hook return values
        useAppUI.mockReturnValue({
            toast: null,
            showToast: vi.fn(),
            dialog: { isOpen: false },
            setDialog: vi.fn(),
            deferredPrompt: null,
            isDarkMode: false,
            toggleTheme: vi.fn(),
            handleInstallApp: vi.fn(),
        });

        useActivityLog.mockReturnValue({
            activityLog: {},
            logStudyActivity: vi.fn(),
        });

        useQuizData.mockReturnValue({
            decks: [],
            questions: [],
            rawTexts: {},
            setDecks: vi.fn(),
            setQuestions: vi.fn(),
            setRawTexts: vi.fn(),
            handleExport: vi.fn(),
            handleImport: vi.fn(),
            selectedDeckId: 'deck-1',
            setSelectedDeckId: vi.fn(),
            handleAddDeckClick: vi.fn(),
            handleDeleteDeckClick: vi.fn(),
            currentRawText: '',
            handleRawTextChange: vi.fn(),
            isTyping: false,
            handleCopyText: vi.fn(),
            handleClearTextClick: vi.fn(),
            settings: {},
            setSettings: vi.fn(),
            activeDeckQuestions: [],
            stats: { total: 0, learned: 0 },
            handleMarkQuestion: vi.fn(),
        });

        useQuizSession.mockReturnValue({
            quizSession: { active: false, isFinished: false },
            showAnswer: false,
            cancelSession: vi.fn(),
            revealAnswer: vi.fn(),
            handleAnswer: vi.fn(),
            resetSession: vi.fn(),
            generateQuiz: vi.fn(),
        });
    });

    it('renders main structure correctly', async () => {
        render(<App />);

        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(await screen.findByTestId('mock-deck-overview')).toBeInTheDocument();
        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
        expect(screen.getByTestId('mock-toast')).toBeInTheDocument();
    });

    it('renders dialog when isOpen is true', async () => {
        useAppUI.mockReturnValue({
            toast: null,
            showToast: vi.fn(),
            dialog: { isOpen: true },
            setDialog: vi.fn(),
            deferredPrompt: null,
            isDarkMode: false,
            toggleTheme: vi.fn(),
            handleInstallApp: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId('mock-custom-dialog')).toBeInTheDocument();
        expect(await screen.findByTestId('mock-deck-overview')).toBeInTheDocument();
    });

    it('renders lazy components properly for active quiz session', async () => {
        useQuizSession.mockReturnValue({
            quizSession: { active: true, isFinished: false },
            showAnswer: false,
            cancelSession: vi.fn(),
            revealAnswer: vi.fn(),
            handleAnswer: vi.fn(),
            resetSession: vi.fn(),
            generateQuiz: vi.fn(),
        });

        render(<App />);

        // Wait for Suspense
        const liveSession = await screen.findByTestId('mock-live-session');
        expect(liveSession).toBeInTheDocument();
    });

    it('renders lazy components properly for finished quiz session', async () => {
        useQuizSession.mockReturnValue({
            quizSession: { active: true, isFinished: true },
            showAnswer: false,
            cancelSession: vi.fn(),
            revealAnswer: vi.fn(),
            handleAnswer: vi.fn(),
            resetSession: vi.fn(),
            generateQuiz: vi.fn(),
        });

        render(<App />);

        const summaryScreen = await screen.findByTestId('mock-summary-screen');
        expect(summaryScreen).toBeInTheDocument();
    });

    it('renders DeckOverview when no session is active', async () => {
        useQuizSession.mockReturnValue({
            quizSession: { active: false, isFinished: false },
            showAnswer: false,
            cancelSession: vi.fn(),
            revealAnswer: vi.fn(),
            handleAnswer: vi.fn(),
            resetSession: vi.fn(),
            generateQuiz: vi.fn(),
        });

        render(<App />);

        const deckOverview = await screen.findByTestId('mock-deck-overview');
        expect(deckOverview).toBeInTheDocument();
    });
});
