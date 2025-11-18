import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DebugCredentials from '../../src/components/DebugCredentials.jsx';

describe('DebugCredentials Component', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console.log before each test
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original console.log after each test
    consoleSpy.mockRestore();
  });

  it('should render the component with correct credentials and a button', () => {
    render(<DebugCredentials />);
    expect(screen.getByText('Debug Credentials')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test credentials in console/i })).toBeInTheDocument();
    expect(screen.getByText('User: 9876543211 / user123')).toBeInTheDocument();
    expect(screen.getByText('Admin: 9876543210 / admin123')).toBeInTheDocument();
  });

  it('should log correct user credential test results to the console on button click', () => {
    render(<DebugCredentials />);
    const button = screen.getByRole('button', { name: /test credentials in console/i });
    fireEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith('=== CREDENTIAL TEST ===');
    expect(consoleSpy).toHaveBeenCalledWith('Test phone:', '9876543211');
    expect(consoleSpy).toHaveBeenCalledWith('Test password:', 'user123');
    expect(consoleSpy).toHaveBeenCalledWith('Phone match:', true);
    expect(consoleSpy).toHaveBeenCalledWith('Password match:', true);
    expect(consoleSpy).toHaveBeenCalledWith('Both match:', true);
  });

  it('should log correct admin credential test results to the console on button click', () => {
    render(<DebugCredentials />);
    const button = screen.getByRole('button', { name: /test credentials in console/i });
    fireEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith('=== ADMIN TEST ===');
    expect(consoleSpy).toHaveBeenCalledWith('Admin phone match:', true);
    expect(consoleSpy).toHaveBeenCalledWith('Admin password match:', true);
    expect(consoleSpy).toHaveBeenCalledWith('Admin both match:', true);
  });
});