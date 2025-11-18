
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../../src/pages/auth/Register';
import { useAuth } from '../../../src/hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the environment variable
vi.stubGlobal('import.meta.env', {
  VITE_STATIC_OTP: '1006',
});

describe('RegisterPage', () => {
  const mockRequestOTP = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
      requestOTP: mockRequestOTP,
      isLoading: false,
      error: null,
    });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

  it('renders the initial phone number step', () => {
    renderComponent();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SEND OTP' })).toBeInTheDocument();
  });

  it('shows an error for an invalid phone number', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit phone number')).toBeInTheDocument();
    });
    expect(mockRequestOTP).not.toHaveBeenCalled();
  });

  it('successfully submits a phone number and moves to the OTP step', async () => {
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    renderComponent();

    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));

    await waitFor(() => {
      expect(mockRequestOTP).toHaveBeenCalledWith('1234567890');
    });

    await waitFor(() => {
      expect(screen.getByText('Enter the 4-digit OTP sent to 1234567890')).toBeInTheDocument();
    });
  });

  it('shows an error for an invalid OTP', async () => {
    renderComponent();
    // First, move to OTP step
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));

    await waitFor(() => {
      expect(screen.getByText('Enter the 4-digit OTP sent to 1234567890')).toBeInTheDocument();
    });

    // Now, enter invalid OTP
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '2' } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '3' } });
    fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'VERIFY OTP' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP. Please try again.')).toBeInTheDocument();
    });
  });

  it('successfully submits an OTP and moves to the details step', async () => {
    renderComponent();
    // First, move to OTP step
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));

    await waitFor(() => {
      expect(screen.getByText('Enter the 4-digit OTP sent to 1234567890')).toBeInTheDocument();
    });

    // Now, enter valid OTP
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'VERIFY OTP' }));

    await waitFor(() => {
      expect(screen.getByText('OTP verified! Please complete your registration.')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });

  it('shows errors for invalid user details', async () => {
    renderComponent();
    // Go to details step
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));
    await waitFor(() => { /* wait for state update */ });
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'VERIFY OTP' }));
    await waitFor(() => { /* wait for state update */ });

    // Test empty fields
    fireEvent.click(screen.getByRole('button', { name: 'COMPLETE REGISTRATION' }));
    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });

    // Test invalid email
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'COMPLETE REGISTRATION' }));
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Test short password
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'COMPLETE REGISTRATION' }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  it('successfully submits the registration form', async () => {
    renderComponent();
    // Go to details step
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));
    await waitFor(() => { /* wait for state update */ });
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'VERIFY OTP' }));
    await waitFor(() => { /* wait for state update */ });

    // Fill in details
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'COMPLETE REGISTRATION' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        phoneNumber: '1234567890',
        otp: '1006',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('toggles password visibility', async () => {
    renderComponent();
    // Go to details step
    mockRequestOTP.mockResolvedValue({ otp: '1006' });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: 'SEND OTP' }));
    await waitFor(() => { /* wait for state update */ });
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '0' } });
    fireEvent.change(screen.getAllByRole('textbox')[3], { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'VERIFY OTP' }));
    await waitFor(() => { /* wait for state update */ });

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = passwordInput.nextElementSibling;

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(passwordInput.type).toBe('text');
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(passwordInput.type).toBe('password');
    });
  });
});

