import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with correct value when current is half of total', () => {
    render(<ProgressBar current={5} total={10} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('value', '5');
    expect(progress).toHaveAttribute('max', '10');
  });

  it('caps the progress value if current exceeds total', () => {
    render(<ProgressBar current={15} total={10} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('value', '15');
  });
});
