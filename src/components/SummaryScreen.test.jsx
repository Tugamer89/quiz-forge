import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SummaryScreen } from './SummaryScreen';

describe('SummaryScreen Component', () => {
  const defaultProps = {
    session: {
      questions: new Array(10).fill({ id: 1 }),
      correctCount: 8,
      incorrectCount: 2,
    },
    onReset: vi.fn(),
    onPlayAgain: vi.fn(),
  };

  it('show correct score and errors', () => {
    render(<SummaryScreen {...defaultProps} />);

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('activate onReset when clicking Exit Quiz', () => {
    render(<SummaryScreen {...defaultProps} />);

    const exitButton = screen.getByRole('button', { name: /exit quiz/i });
    fireEvent.click(exitButton);

    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('activates onPlayAgain when you click Play Again', () => {
    render(<SummaryScreen {...defaultProps} />);

    const playAgainButton = screen.getByRole('button', { name: /play again/i });
    fireEvent.click(playAgainButton);

    expect(defaultProps.onPlayAgain).toHaveBeenCalledTimes(1);
  });
});
