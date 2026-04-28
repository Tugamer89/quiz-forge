import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomDialog } from './CustomDialog';

describe('CustomDialog Component', () => {
  const defaultProps = {
    dialog: {
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      onConfirm: vi.fn(),
    },
    onClose: vi.fn(),
  };

  it('renders title and message based on dialog properties', () => {
    render(<CustomDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('triggers the onClose callback when the Cancel button is clicked', () => {
    render(<CustomDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('triggers the onConfirm and onClose callbacks when the Confirm button is clicked', () => {
    render(<CustomDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(defaultProps.dialog.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
