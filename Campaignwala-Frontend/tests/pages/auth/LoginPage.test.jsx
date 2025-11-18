
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../../src/pages/auth/LoginPage';
import { useAuth } from '../../../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockLogin = vi.fn();

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: MemoryRouter });
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
  });

  it('should render all form elements correctly', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('should allow user to enter phone number and password', () => {
    renderWithRouter(<LoginPage />);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(phoneInput.value).toBe('1234567890');
    expect(passwordInput.value).toBe('password123');
  });

  it('should show/hide password when eye icon is clicked', () => {
    renderWithRouter(<LoginPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should call login function on form submission with correct credentials', async () => {
    renderWithRouter(<LoginPage />);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await vi.waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        phoneNumber: '1234567890',
        password: 'password123',
      });
    });
  });

  it('should display an error message if login fails', () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
    });

    renderWithRouter(<LoginPage />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should disable the login button and show loading text when loading', () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    renderWithRouter(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /logging in.../i });
    expect(loginButton).toBeDisabled();
  });

  it('should navigate to /forgot-password when "Forgot Password?" is clicked', () => {
    const { container } = renderWithRouter(<LoginPage />);
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    
    fireEvent.click(forgotPasswordLink);
    
    // This doesn't test navigation itself, but that the link is correct
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('should navigate to /register when "Register" is clicked', () => {
    renderWithRouter(<LoginPage />);
    const registerLink = screen.getByRole('link', { name: /register/i });
    
    fireEvent.click(registerLink);

    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
