import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogoutPage from '../../../src/adminDashboard/pages/LogoutPage';
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

describe('LogoutPage', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the logout message', () => {
    render(<LogoutPage />, { wrapper: MemoryRouter });

    expect(screen.getByText('Logging out...')).toBeInTheDocument();
    expect(screen.getByText('You are being logged out. Redirecting to login page.')).toBeInTheDocument();
  });

  it('redirects to the login page after a delay', () => {
    render(<LogoutPage />, { wrapper: MemoryRouter });

    // Initially, navigate should not have been called
    expect(mockedNavigate).not.toHaveBeenCalled();

    // Advance timers by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now, navigate should have been called with the login path
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
