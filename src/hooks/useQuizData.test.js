import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useQuizData } from './useQuizData';
import { useLocalStorage } from './useLocalStorage';
import * as Sentry from '@sentry/react';

vi.mock('./useLocalStorage', () => ({
    useLocalStorage: vi.fn(),
}));

vi.mock('@sentry/react', () => ({
    setTag: vi.fn(),
}));

describe('useQuizData Hook', () => {
    let mockStates;
    let setMockStates;
    let mockShowToast;
    let mockSetDialog;

    beforeEach(() => {
        vi.clearAllMocks();

        mockStates = {
            quiz_decks: [{ id: 'default', name: 'General Knowledge' }],
            quiz_selected_deck: 'default',
            quiz_questions: [],
            quiz_rawTexts: { default: '' },
            quiz_settings: {
                numToGenerate: 5,
                includeUnanswered: true,
                includeCorrect: false,
                includeIncorrect: true,
                includePartiallyCorrect: true,
                srsEnabled: false,
            },
        };

        setMockStates = {
            quiz_decks: vi.fn((update) => {
                mockStates['quiz_decks'] =
                    typeof update === 'function' ? update(mockStates['quiz_decks']) : update;
            }),
            quiz_selected_deck: vi.fn((update) => {
                mockStates['quiz_selected_deck'] =
                    typeof update === 'function'
                        ? update(mockStates['quiz_selected_deck'])
                        : update;
            }),
            quiz_questions: vi.fn((update) => {
                mockStates['quiz_questions'] =
                    typeof update === 'function' ? update(mockStates['quiz_questions']) : update;
            }),
            quiz_rawTexts: vi.fn((update) => {
                mockStates['quiz_rawTexts'] =
                    typeof update === 'function' ? update(mockStates['quiz_rawTexts']) : update;
            }),
            quiz_settings: vi.fn((update) => {
                mockStates['quiz_settings'] =
                    typeof update === 'function' ? update(mockStates['quiz_settings']) : update;
            }),
        };

        useLocalStorage.mockImplementation((key, initialValue) => {
            if (!(key in mockStates)) {
                mockStates[key] = initialValue;
            }
            return [mockStates[key], setMockStates[key]];
        });

        mockShowToast = vi.fn();
        mockSetDialog = vi.fn();

        vi.stubGlobal('crypto', {
            randomUUID: vi.fn().mockReturnValue('mock-uuid-1234'),
        });

        vi.stubGlobal('navigator', {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(true),
            },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        expect(result.current.decks).toEqual([{ id: 'default', name: 'General Knowledge' }]);
        expect(result.current.selectedDeckId).toBe('default');
        expect(result.current.questions).toEqual([]);
        expect(result.current.rawTexts).toEqual({ default: '' });
        expect(result.current.isTyping).toBe(false);
        expect(result.current.currentRawText).toBe('');
        expect(result.current.activeDeckQuestions).toEqual([]);
        expect(result.current.stats).toEqual({
            total: 0,
            unanswered: 0,
            correct: 0,
            incorrect: 0,
            partiallyCorrect: 0,
        });

        expect(Sentry.setTag).toHaveBeenCalledWith('srs_enabled', false);
    });

    it('handleRawTextChange updates rawTexts and sets isTyping', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleRawTextChange('1. First question\nAnswer to first');
        });

        expect(setMockStates['quiz_rawTexts']).toHaveBeenCalled();
        expect(mockStates['quiz_rawTexts']).toEqual({
            default: '1. First question\nAnswer to first',
        });
        expect(result.current.isTyping).toBe(true);
    });

    it('debounced parsing generates questions correctly', () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleRawTextChange('1. Test Question #tag1\nTest Answer #tag2');
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(result.current.isTyping).toBe(false);
        expect(mockStates['quiz_questions']).toHaveLength(1);
        expect(mockStates['quiz_questions'][0]).toEqual(
            expect.objectContaining({
                id: 'mock-uuid-1234',
                number: '1',
                text: 'Test Question #tag1',
                answer: 'Test Answer #tag2',
                status: 'unanswered',
                deckId: 'default',
                tags: ['#tag1', '#tag2'],
                easeFactor: 2.5,
                interval: 0,
                repetition: 0,
                nextReviewDate: null,
            })
        );

        vi.useRealTimers();
    });
    it('handleAddDeckClick creates a new deck', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleAddDeckClick();
        });

        expect(mockSetDialog).toHaveBeenCalled();
        const dialogConfig = mockSetDialog.mock.calls[0][0];
        expect(dialogConfig.type).toBe('prompt');

        act(() => {
            dialogConfig.onConfirm('New Deck Name');
        });

        expect(mockStates['quiz_decks']).toHaveLength(2);
        expect(mockStates['quiz_decks'][1]).toEqual({
            id: 'mock-uuid-1234',
            name: 'New Deck Name',
        });
        expect(mockStates['quiz_selected_deck']).toBe('mock-uuid-1234');
        expect(mockShowToast).toHaveBeenCalledWith('Deck "New Deck Name" created!', 'success');
    });

    it('handleAddDeckClick prevents creating a deck with an existing name', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleAddDeckClick();
        });

        const dialogConfig = mockSetDialog.mock.calls[0][0];

        act(() => {
            dialogConfig.onConfirm('General Knowledge');
        });

        expect(mockStates['quiz_decks']).toHaveLength(1);
        expect(mockShowToast).toHaveBeenCalledWith(
            'A deck with this name already exists.',
            'error'
        );
    });

    it('handleAddDeckClick prevents creating a deck with a name longer than 100 characters', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleAddDeckClick();
        });

        const dialogConfig = mockSetDialog.mock.calls[0][0];
        const longName = 'a'.repeat(101);

        act(() => {
            dialogConfig.onConfirm(longName);
        });

        expect(mockStates['quiz_decks']).toHaveLength(1);
        expect(mockShowToast).toHaveBeenCalledWith(
            'Deck name cannot exceed 100 characters.',
            'error'
        );
    });

    it('handleDeleteDeckClick prevents deleting the last deck', () => {
        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleDeleteDeckClick();
        });

        expect(mockShowToast).toHaveBeenCalledWith('You cannot delete the last deck.', 'error');
        expect(mockSetDialog).not.toHaveBeenCalled();
    });

    it('handleDeleteDeckClick deletes deck and associated questions', () => {
        mockStates['quiz_decks'] = [
            { id: 'default', name: 'General Knowledge' },
            { id: 'deck-2', name: 'Second Deck' },
        ];
        mockStates['quiz_selected_deck'] = 'deck-2';
        mockStates['quiz_questions'] = [
            { id: 'q1', deckId: 'default' },
            { id: 'q2', deckId: 'deck-2' },
        ];
        mockStates['quiz_rawTexts'] = { default: 'def', 'deck-2': 'test' };

        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleDeleteDeckClick();
        });

        expect(mockSetDialog).toHaveBeenCalled();
        const dialogConfig = mockSetDialog.mock.calls[0][0];
        expect(dialogConfig.type).toBe('confirm');

        act(() => {
            dialogConfig.onConfirm();
        });

        expect(mockStates['quiz_decks']).toHaveLength(1);
        expect(mockStates['quiz_decks'][0].id).toBe('default');
        expect(mockStates['quiz_questions']).toHaveLength(1);
        expect(mockStates['quiz_questions'][0].id).toBe('q1');
        expect(mockStates['quiz_rawTexts']).toEqual({ default: 'def' });
        expect(mockStates['quiz_selected_deck']).toBe('default');
        expect(mockShowToast).toHaveBeenCalledWith('Deck deleted.', 'info');
    });
    it('handleClearTextClick clears raw text and questions', () => {
        mockStates['quiz_questions'] = [{ id: 'q1', deckId: 'default' }];
        mockStates['quiz_rawTexts'] = { default: 'test raw text' };

        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleClearTextClick();
        });

        const dialogConfig = mockSetDialog.mock.calls[0][0];

        act(() => {
            dialogConfig.onConfirm();
        });

        expect(mockStates['quiz_rawTexts']).toEqual({ default: '' });
        expect(mockStates['quiz_questions']).toHaveLength(0);
        expect(mockShowToast).toHaveBeenCalledWith('Text cleared.', 'info');
    });

    it('handleCopyText copies to clipboard', async () => {
        mockStates['quiz_rawTexts'] = { default: 'text to copy' };

        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        await act(async () => {
            await result.current.handleCopyText();
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('text to copy');
        expect(mockShowToast).toHaveBeenCalledWith('Text copied to clipboard!', 'success');
    });

    it('handleExport creates a Blob and triggers download', () => {
        const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
        const revokeObjectURLMock = vi.fn();

        vi.stubGlobal('URL', {
            createObjectURL: createObjectURLMock,
            revokeObjectURL: revokeObjectURLMock,
        });

        const mockLink = {
            href: '',
            download: '',
            click: vi.fn(),
            remove: vi.fn(),
        };

        const originalCreateElement = document.createElement.bind(document);
        const originalAppendChild = document.body.appendChild.bind(document.body);

        const createElementMock = vi
            .spyOn(document, 'createElement')
            .mockImplementation((tagName) => {
                if (tagName === 'a') return mockLink;
                return originalCreateElement(tagName);
            });

        const appendChildMock = vi
            .spyOn(document.body, 'appendChild')
            .mockImplementation((node) => {
                if (node === mockLink) return mockLink;
                return originalAppendChild(node);
            });

        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleExport();
        });

        expect(createObjectURLMock).toHaveBeenCalled();
        expect(createElementMock).toHaveBeenCalledWith('a');
        expect(mockLink.href).toBe('blob:test');
        expect(mockLink.download).toMatch(/quiz-forge-backup-.*\.json/);

        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.remove).toHaveBeenCalled();
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test');
        expect(mockShowToast).toHaveBeenCalledWith('Backup exported successfully!', 'success');

        createElementMock.mockRestore();
        appendChildMock.mockRestore();
    });

    it('handleMarkQuestion updates question status', () => {
        mockStates['quiz_questions'] = [{ id: 'q1', status: 'unanswered', deckId: 'default' }];

        const { result } = renderHook(() => useQuizData(mockShowToast, mockSetDialog));

        act(() => {
            result.current.handleMarkQuestion('q1', 'correct');
        });

        expect(mockStates['quiz_questions'][0].status).toBe('correct');
    });
});
