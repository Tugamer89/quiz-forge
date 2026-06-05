import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

// Mock package.json to test the version default fallback
vi.mock('../../../package.json', () => ({
    default: {
        version: '1.2.3',
    },
}));

describe('Footer Component', () => {
    it('renders the brand section correctly', () => {
        render(<Footer />);
        expect(screen.getByText('Quiz Forge')).toBeInTheDocument();
        expect(screen.getByText(/Empowering your learning journey/)).toBeInTheDocument();
    });

    it('renders the links correctly', () => {
        render(<Footer />);
        const sourceLink = screen.getByText(/Project Source/);
        expect(sourceLink).toBeInTheDocument();
        expect(sourceLink.closest('a')).toHaveAttribute(
            'href',
            'https://github.com/tugamer89/quiz-forge'
        );

        const issueLink = screen.getByText(/Report an Issue/);
        expect(issueLink).toBeInTheDocument();
        expect(issueLink.closest('a')).toHaveAttribute(
            'href',
            'https://github.com/tugamer89/quiz-forge/issues'
        );
    });

    it('renders the built with section', () => {
        render(<Footer />);
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Tailwind')).toBeInTheDocument();
        expect(screen.getByText('Lucide')).toBeInTheDocument();
    });

    it('renders the developer credits', () => {
        render(<Footer />);
        expect(screen.getByText('Tugamer89')).toBeInTheDocument();
        expect(screen.getByText('Tugamer89').closest('a')).toHaveAttribute(
            'href',
            'https://github.com/tugamer89'
        );
    });

    it('renders the copyright section', () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear();
        expect(
            screen.getByText(new RegExp(`© ${currentYear} Quiz Forge. Crafted with`))
        ).toBeInTheDocument();
        expect(screen.getByText('for lifelong learners.')).toBeInTheDocument();
    });

    it('renders the version from package.json if VITE_APP_VERSION is not set', () => {
        // VITE_APP_VERSION is undefined in this test environment by default
        render(<Footer />);
        expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    });

    it('renders the version from import.meta.env.VITE_APP_VERSION if set', () => {
        vi.stubEnv('VITE_APP_VERSION', 'v4.5.6');
        render(<Footer />);
        expect(screen.getByText('v4.5.6')).toBeInTheDocument();
        vi.unstubAllEnvs();
    });
});
