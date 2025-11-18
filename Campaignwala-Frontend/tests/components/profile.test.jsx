
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileMenu from '../../src/components/profile';

describe('ProfileMenu Component', () => {
  it('should render the profile button', () => {
    render(<ProfileMenu />);
    expect(screen.getByLabelText('Profile menu')).toBeInTheDocument();
  });

  it('should open the dropdown menu on click', () => {
    render(<ProfileMenu />);
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@freelancer.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should close the dropdown menu on a second click', () => {
    render(<ProfileMenu />);
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('should close the dropdown when clicking outside', () => {
    render(<ProfileMenu />);
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);
    fireEvent.click(document.body);
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('should handle the logout action', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<ProfileMenu />);
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(consoleSpy).toHaveBeenCalledWith('Logging out...');
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
