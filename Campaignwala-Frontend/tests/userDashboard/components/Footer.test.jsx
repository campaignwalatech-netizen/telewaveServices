
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../../../src/userDashboard/components/Footer';

describe('Footer Component', () => {

  it('should render all links and copyright text', () => {
    render(<Footer darkMode={false} />);

    // Check for links
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();

    // Check for social icons (represented by text here)
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('📷')).toBeInTheDocument();
    expect(screen.getByText('💼')).toBeInTheDocument();

    // Check for copyright
    expect(screen.getByText(/© campaignwala by codessy/i)).toBeInTheDocument();
  });

  it('should have correct href attributes on links', () => {
    render(<Footer darkMode={false} />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
        expect(link).toHaveAttribute('href', '#');
    });
  });

  it('should apply light mode classes by default', () => {
    const { container } = render(<Footer darkMode={false} />);
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('text-gray-600');
  });

  it('should apply dark mode classes when darkMode is true', () => {
    const { container } = render(<Footer darkMode={true} />);
    expect(container.firstChild).toHaveClass('bg-gray-800');
    expect(container.firstChild).toHaveClass('text-gray-400');
  });

});
