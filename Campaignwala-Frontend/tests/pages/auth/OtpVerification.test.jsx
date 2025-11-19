
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OtpVerification from '../../../src/pages/auth/OtpVerification';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: vi.fn(),
    };
});

const useLocation = vi.mocked(require('react-router-dom').useLocation);

describe('OtpVerification Page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
    useLocation.mockReturnValue({
      state: { phone: '1234567890', userType: 'user' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/otp-verification']}>
        <Routes>
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/user" element={<div>User Dashboard</div>} />
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render the OTP verification form correctly', () => {
    renderWithRouter();
    expect(screen.getByText(/verify otp/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the 4-digit code sent to/i)).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(6);
    expect(screen.getByRole('button', { name: /verify & continue/i })).toBeInTheDocument();
  });

  it('should redirect to login if phone or userType is not in location state', () => {
    useLocation.mockReturnValue({ state: null });
    renderWithRouter();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle OTP input and auto-focus to the next field', () => {
    renderWithRouter();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0].value).toBe('1');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('should handle backspace to focus the previous field', () => {
    renderWithRouter();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('should handle pasting an OTP code', () => {
    renderWithRouter();
    const inputs = screen.getAllByRole('textbox');
    const pasteEvent = {
      clipboardData: {
        getData: vi.fn().mockReturnValue('123456'),
      },
      preventDefault: vi.fn(),
    };
    fireEvent.paste(inputs[0], pasteEvent);
    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    inputs.forEach((input, i) => {
      expect(input.value).toBe(String(i + 1));
    });
  });

  it('should show an error for incomplete OTP', () => {
    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));
    expect(screen.getByText(/please enter complete otp/i)).toBeInTheDocument();
  });

  it('should verify correct OTP, set localStorage, and navigate for user', () => {
    renderWithRouter();
    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((char, i) => {
      fireEvent.change(inputs[i], { target: { value: char } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    vi.runAllTimers(); // For the setTimeout before navigation

    expect(localStorage.getItem('isLoggedIn')).toBe('true');
    expect(localStorage.getItem('userPhone')).toBe('1234567890');
    expect(localStorage.getItem('userType')).toBe('user');
    expect(mockNavigate).toHaveBeenCalledWith('/user');
  });

  it('should navigate to admin dashboard for admin userType', () => {
    useLocation.mockReturnValue({ state: { phone: '0987654321', userType: 'admin' } });
    renderWithRouter();
    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((char, i) => {
      fireEvent.change(inputs[i], { target: { value: char } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    vi.runAllTimers();

    expect(localStorage.getItem('userType')).toBe('admin');
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('should handle the resend timer and button', () => {
    renderWithRouter();
    expect(screen.getByText(/resend code in/i)).toBeInTheDocument();

    act(() => {
        vi.advanceTimersByTime(30000);
    });

    const resendButton = screen.getByRole('button', { name: /resend code/i });
    expect(resendButton).toBeInTheDocument();

    fireEvent.click(resendButton);
    expect(screen.getByText(/resend code in/i)).toBeInTheDocument();
    expect(screen.getByText(/30s/i)).toBeInTheDocument();
  });
});
