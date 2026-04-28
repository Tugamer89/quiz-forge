import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with 0% width when current is 0', () => {
    const { container } = render(<ProgressBar current={0} total={10} />);

    const progressFill = container.querySelector('.bg-indigo-600');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('renders with 50% width when current is half of total', () => {
    const { container } = render(<ProgressBar current={5} total={10} />);

    const progressFill = container.querySelector('.bg-indigo-600');
    expect(progressFill).toHaveStyle({ width: '50%' });
  });

  it('caps the progress width at 100% if current exceeds total', () => {
    const { container } = render(<ProgressBar current={15} total={10} />);

    const progressFill = container.querySelector('.bg-indigo-600');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('keeps the progress width at 0% if current is negative', () => {
    const { container } = render(<ProgressBar current={-2} total={10} />);

    const progressFill = container.querySelector('.bg-indigo-600');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });
});
