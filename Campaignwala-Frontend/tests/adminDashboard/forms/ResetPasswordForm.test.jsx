
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResetPasswordForm from '../../../src/adminDashboard/forms/ResetPasswordForm';
import authService from '../../../src/services/authService';

// Mock the authService
vi.mock('../../../src/services/authService', () => ({
  default: {
    resetPassword: vi.fn(),
  },
}));

describe('ResetPasswordForm Component', () => {
  let alertSpy;

  it('should render the form with all fields', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText('Reset User Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/otp verification/i)).toBeInTheDocument();
  });

  describe('Form Submission and Validation', () => {
    beforeEach(() => {
      alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.clearAllMocks();
    });

    afterEach(() => {
      alertSpy.mockRestore();
    });

    it('should show an alert if passwords do not match', () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(alertSpy).toHaveBeenCalledWith('Passwords do not match!');
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should show an alert for an invalid OTP', () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/otp verification/i), { target: { value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      expect(alertSpy).toHaveBeenCalledWith('Please enter a valid 4-digit OTP!');
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword service and show success on valid submission', async () => {
      authService.resetPassword.mockResolvedValue({ success: true, message: 'Password reset successfully!' });
      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/otp verification/i), { target: { value: '123456' } });

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled(); // Assumes button is disabled on submit
      expect(submitButton).toHaveTextContent('Resetting...'); // Assumes text changes

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith({
          phone: '1234567890',
          newPassword: 'password123',
          otp: '123456',
        });
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Password reset successfully!');
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Reset Password');
      });
    });

    it('should handle API error on submission', async () => {
      authService.resetPassword.mockResolvedValue({ success: false, message: 'Invalid OTP or user.' });
      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/otp verification/i), { target: { value: '123456' } });

      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Invalid OTP or user.');
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
