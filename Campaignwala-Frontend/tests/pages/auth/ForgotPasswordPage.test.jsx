
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from '../../../src/pages/auth/ForgotPasswordPage';
import LoginPage from '../../../src/pages/auth/LoginPage'; // For navigation testing
import { useAuth } from '../../../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockRequestPasswordReset = vi.fn();
const mockResetUserPassword = vi.fn();

const renderWithRouter = (initialEntries = ['/forgot-password']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
      resetUserPassword: mockResetUserPassword,
      isLoading: false,
      error: null,
    });
  });

  it('should render the initial phone number step', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset otp/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('should show an error for an invalid phone number', () => {
    renderWithRouter();
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset otp/i }));
    expect(screen.getByText(/please enter a valid 10-digit phone number/i)).toBeInTheDocument();
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it('should proceed to OTP step on valid phone number submission', async () => {
    mockRequestPasswordReset.mockResolvedValue({ otp: '1234' });
    renderWithRouter();

    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset otp/i }));

    await vi.waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('1234567890');
    });

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should show an error if passwords do not match', async () => {
    renderWithRouter();
    // Go to OTP step
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset otp/i }));
    await vi.waitFor(() => expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument());

    // Fill form with mismatching passwords
    fireEvent.change(screen.getByLabelText(/otp code/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockResetUserPassword).not.toHaveBeenCalled();
  });

  it('should proceed to success step on valid password reset', async () => {
    mockResetUserPassword.mockResolvedValue({});
    renderWithRouter();
    // Go to OTP step
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset otp/i }));
    await vi.waitFor(() => expect(screen.getByLabelText(/otp code/i)).toBeInTheDocument());

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/otp code/i), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await vi.waitFor(() => {
      expect(mockResetUserPassword).toHaveBeenCalledWith({
        phoneNumber: '1234567890',
        otp: '1234',
        newPassword: 'newpassword123',
      });
    });

    expect(screen.getByText(/password reset!/i)).toBeInTheDocument();
    expect(screen.getByText(/your password has been reset successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
  });

  it('should navigate to login page when "Back to Login" is clicked', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText(/back to login/i));
    // Check if the login page content is rendered
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
