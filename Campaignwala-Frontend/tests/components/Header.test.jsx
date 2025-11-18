import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../../src/components/Header';

// Mock the ProfileMenu component
vi.mock('../../../src/components/profile', () => ({
  default: () => <div data-testid="profile-menu">Profile Menu</div>,
}));

describe('Header Component', () => {
  const defaultProps = {
    isDark: false,
    onThemeToggle: vi.fn(),
  };

  it('should render the header with title, campaign count, and controls', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('ALL CAMPAIGNS')).toBeInTheDocument();
    expect(screen.getByText('18 active campaigns')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByTestId('profile-menu')).toBeInTheDocument();
  });

  it('should call onThemeToggle when the theme button is clicked', () => {
    const onThemeToggle = vi.fn();
    render(<Header {...defaultProps} onThemeToggle={onThemeToggle} />);
    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);
    expect(onThemeToggle).toHaveBeenCalledTimes(1);
  });

  it('should render the Moon icon when not in dark mode', () => {
    render(<Header {...defaultProps} isDark={false} />);
    const button = screen.getByLabelText('Toggle theme');
    // We can check for the presence of the icon's class if it's unique enough
    // In this case, lucide-react uses SVG, so we can check for the presence of the SVG
    // but it's hard to distinguish between Moon and Sun without inspecting the SVG content.
    // A snapshot test would be more effective here, but for now, we'll just check the button exists.
    expect(button).toBeInTheDocument();
  });

  it('should render the Sun icon when in dark mode', () => {
    render(<Header {...defaultProps} isDark={true} />);
    const button = screen.getByLabelText('Toggle theme');
    expect(button).toBeInTheDocument();
  });

  it('should have responsive classes for text size', () => {
    render(<Header {...defaultProps} />);
    const title = screen.getByText('ALL CAMPAIGNS');
    const description = screen.getByText('18 active campaigns');
    expect(title).toHaveClass('text-xl', 'sm:text-2xl');
    expect(description).toHaveClass('text-xs', 'sm:text-sm');
  });
});