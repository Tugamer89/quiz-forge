import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toast } from './Toast';

describe('Toast Component', () => {
  it('do not render anything if show is false', () => {
    const toastData = {
      show: false,
      message: "I shouldn't appear",
      type: 'info',
    };

    const { container } = render(<Toast toast={toastData} />);
    expect(container.firstChild).toBeNull();
  });

  it('correctly renders the toast message when show is true', () => {
    const toastData = {
      show: true,
      message: 'Data saved successfully!',
      type: 'success',
      id: 1,
      duration: 3000,
    };

    render(<Toast toast={toastData} />);

    expect(screen.getByText('Data saved successfully!')).toBeInTheDocument();
  });
});
