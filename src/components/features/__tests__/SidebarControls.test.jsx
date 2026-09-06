import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SidebarControls } from '../SidebarControls';

// Mock ActivityHeatmap so it doesn't try to render complex SVG or date logic
vi.mock('../ActivityHeatmap', () => ({
    ActivityHeatmap: () => <div data-testid="activity-heatmap-mock">Activity Heatmap</div>,
}));

describe('SidebarControls', () => {
    let user;

    const mockDecks = [
        { id: 'deck-1', name: 'Deck One' },
        { id: 'deck-2', name: 'Deck Two' },
    ];

    const defaultProps = {
        decks: mockDecks,
        selectedDeckId: 'deck-1',
        onSelectDeck: vi.fn(),
        onAddDeck: vi.fn(),
        onDeleteDeck: vi.fn(),
        currentRawText: '',
        onRawTextChange: vi.fn(),
        isTyping: false,
        onCopyText: vi.fn().mockResolvedValue(),
        onClearText: vi.fn(),
        settings: {
            srsEnabled: false,
            numToGenerate: 10,
            includeUnanswered: true,
            includeIncorrect: true,
            includePartiallyCorrect: true,
            includeCorrect: false,
        },
        onSettingsChange: vi.fn(),
        stats: {
            unanswered: 5,
            incorrect: 2,
            partiallyCorrect: 1,
            correct: 10,
        },
        activeDeckQuestionsLength: 18,
        onGenerateQuiz: vi.fn(),
        deckLog: {},
    };

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    it('renders the component with correct sections', () => {
        render(<SidebarControls {...defaultProps} />);

        expect(screen.getByText('Deck')).toBeInTheDocument();
        expect(screen.getByText('Raw Text')).toBeInTheDocument();
        expect(screen.getByText('Quiz Setup')).toBeInTheDocument();
        expect(screen.getByTestId('activity-heatmap-mock')).toBeInTheDocument();
    });

    describe('Deck Management', () => {
        it('allows selecting a different deck', async () => {
            render(<SidebarControls {...defaultProps} />);

            const select = screen.getByRole('combobox', { name: /select deck/i });
            await user.selectOptions(select, 'deck-2');

            expect(defaultProps.onSelectDeck).toHaveBeenCalledWith('deck-2');
        });

        it('calls onAddDeck when the add button is clicked', async () => {
            render(<SidebarControls {...defaultProps} />);

            const addBtn = screen.getByRole('button', { name: /add deck/i });
            await user.click(addBtn);

            expect(defaultProps.onAddDeck).toHaveBeenCalled();
        });

        it('calls onDeleteDeck when delete button is clicked', async () => {
            render(<SidebarControls {...defaultProps} />);

            const delBtn = screen.getByRole('button', { name: /delete deck/i });
            await user.click(delBtn);

            expect(defaultProps.onDeleteDeck).toHaveBeenCalled();
        });

        it('disables delete button if there is only one deck', () => {
            render(
                <SidebarControls {...defaultProps} decks={[{ id: 'deck-1', name: 'Deck One' }]} />
            );

            const delBtn = screen.getByRole('button', { name: /delete deck/i });
            expect(delBtn).toBeDisabled();
        });
    });

    describe('Raw Text Input', () => {
        it('calls onRawTextChange when typing in the textarea', async () => {
            render(<SidebarControls {...defaultProps} />);

            const textarea = screen.getByRole('textbox', { name: /raw text input/i });
            await user.type(textarea, 'Hello');

            expect(defaultProps.onRawTextChange).toHaveBeenCalled();
        });

        it('displays "Saving..." indicator when isTyping is true', () => {
            render(<SidebarControls {...defaultProps} isTyping={true} />);
            expect(screen.getByText('Saving...')).toBeInTheDocument();
        });

        it('clears text when eraser button is clicked', async () => {
            render(<SidebarControls {...defaultProps} currentRawText="Some text" />);

            const clearBtn = screen.getByRole('button', { name: /erase all text/i });
            await user.click(clearBtn);

            expect(defaultProps.onClearText).toHaveBeenCalled();
        });

        it('disables copy and clear buttons when text is empty', () => {
            render(<SidebarControls {...defaultProps} currentRawText="" />);

            const copyBtn = screen.getByRole('button', { name: /copy/i, exact: false });
            const clearBtn = screen.getByRole('button', { name: /erase all text/i });

            expect(copyBtn).toBeDisabled();
            expect(clearBtn).toBeDisabled();
        });
    });

    describe('Text Formatting', () => {
        // Since jsdom doesn't fully support selection start/end in the same way,
        // we can test that the formatting buttons call onRawTextChange with the expected formatting.
        it('applies bold formatting', async () => {
            render(<SidebarControls {...defaultProps} currentRawText="test" />);

            const textarea = screen.getByRole('textbox', { name: /raw text input/i });
            // Simulate selecting the whole text "test"
            textarea.setSelectionRange(0, 4);

            const boldBtn = screen.getByRole('button', { name: /bold text/i });
            await user.click(boldBtn);

            expect(defaultProps.onRawTextChange).toHaveBeenCalledWith('**test**');
        });

        it('applies italic formatting', async () => {
            render(<SidebarControls {...defaultProps} currentRawText="test" />);

            const textarea = screen.getByRole('textbox', { name: /raw text input/i });
            textarea.setSelectionRange(0, 4);

            const italicBtn = screen.getByRole('button', { name: /italic text/i });
            await user.click(italicBtn);

            expect(defaultProps.onRawTextChange).toHaveBeenCalledWith('*test*');
        });

        it('applies inline code formatting', async () => {
            render(<SidebarControls {...defaultProps} currentRawText="test" />);

            const textarea = screen.getByRole('textbox', { name: /raw text input/i });
            textarea.setSelectionRange(0, 4);

            const codeBtn = screen.getByRole('button', { name: /inline code/i });
            await user.click(codeBtn);

            expect(defaultProps.onRawTextChange).toHaveBeenCalledWith('`test`');
        });

        it('applies code block formatting', async () => {
            render(<SidebarControls {...defaultProps} currentRawText="test" />);

            const textarea = screen.getByRole('textbox', { name: /raw text input/i });
            textarea.setSelectionRange(0, 4);

            const codeBlockBtn = screen.getByRole('button', { name: /code block/i });
            await user.click(codeBlockBtn);

            expect(defaultProps.onRawTextChange).toHaveBeenCalledWith('```\ntest\n```');
        });
    });

    describe('Settings and Actions', () => {
        it('toggles SRS setting', async () => {
            render(<SidebarControls {...defaultProps} />);

            const srsToggle = screen.getByRole('checkbox', { name: /toggle spaced repetition/i });
            await user.click(srsToggle);

            expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
                expect.objectContaining({ srsEnabled: true })
            );
        });

        it('changes questions per session', async () => {
            render(<SidebarControls {...defaultProps} />);

            const numInput = screen.getByLabelText(/questions per session/i);
            await user.clear(numInput);
            fireEvent.change(numInput, { target: { value: '15' } });

            expect(defaultProps.onSettingsChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ numToGenerate: 15 })
            );
        });

        it('toggles inclusion status checkboxes', async () => {
            render(<SidebarControls {...defaultProps} />);

            // Unanswered is true initially, so clicking it sets it to false
            const unansweredCb = screen.getByRole('checkbox', {
                name: /include unanswered questions/i,
            });
            await user.click(unansweredCb);

            expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
                expect.objectContaining({ includeUnanswered: false })
            );
        });

        it('disables the Start Quiz button if activeDeckQuestionsLength is 0', () => {
            render(<SidebarControls {...defaultProps} activeDeckQuestionsLength={0} />);

            const startBtn = screen.getByRole('button', { name: /start quiz/i });
            expect(startBtn).toBeDisabled();
        });

        it('calls onGenerateQuiz when Start Quiz is clicked', async () => {
            render(<SidebarControls {...defaultProps} />);

            const startBtn = screen.getByRole('button', { name: /start quiz/i });
            await user.click(startBtn);

            expect(defaultProps.onGenerateQuiz).toHaveBeenCalled();
        });
    });
});
