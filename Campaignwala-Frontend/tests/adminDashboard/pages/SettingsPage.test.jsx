
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '../../../src/adminDashboard/pages/SettingsPage';
import { vi } from 'vitest';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('SettingsPage', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => 'false');
    Storage.prototype.setItem = vi.fn();
  });

  it('renders the settings page correctly', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });

    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@freelancer.com')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('toggles email notifications', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });

    const emailToggle = screen.getAllByRole('checkbox')[0];
    expect(emailToggle.checked).toBe(true);

    fireEvent.click(emailToggle);
    expect(emailToggle.checked).toBe(false);

    fireEvent.click(emailToggle);
    expect(emailToggle.checked).toBe(true);
  });

  it('toggles dark mode and updates localStorage', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });

    const darkModeToggle = screen.getAllByRole('checkbox')[1];
    expect(darkModeToggle.checked).toBe(false);

    fireEvent.click(darkModeToggle);
    expect(darkModeToggle.checked).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'true');

    fireEvent.click(darkModeToggle);
    expect(darkModeToggle.checked).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  it('navigates to the reset password page when "Change" is clicked', () => {
    render(<SettingsPage />, { wrapper: MemoryRouter });

    const changePasswordButton = screen.getByRole('button', { name: 'Change' });
    fireEvent.click(changePasswordButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/admin/reset-password');
  });
});
