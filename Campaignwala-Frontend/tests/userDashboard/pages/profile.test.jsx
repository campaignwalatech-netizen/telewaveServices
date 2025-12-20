
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ProfileOverview from '../../../src/userDashboard/pages/profile';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('ProfileOverview', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderComponent = (darkMode = false) =>
    render(
      <MemoryRouter>
        <ProfileOverview darkMode={darkMode} />
      </MemoryRouter>
    );

  it('renders all profile sections correctly', () => {
    renderComponent();

    // Check user info
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@freelancerwala.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toBeInTheDocument();

    // Check KYC status
    expect(screen.getByText('KYC Verification Status')).toBeInTheDocument();
    expect(screen.getByText('Pending Review by Admin')).toBeInTheDocument();

    // Check Campaign Card
    expect(screen.getByText('YOUR FREELANCER WALA CARD')).toBeInTheDocument();
    expect(screen.getByAltText('Digital Card')).toBeInTheDocument();
  });

  it('navigates to KYC details page on button click', () => {
    renderComponent();

    const kycButton = screen.getByRole('button', { name: 'Update Profile / KYC' });
    fireEvent.click(kycButton);

    expect(mockNavigate).toHaveBeenCalledWith('/user/kyc-details');
  });

  it('applies light mode styles correctly', () => {
    const { container } = renderComponent(false);
    expect(container.firstChild).toHaveClass('bg-gray-50', 'text-gray-900');
  });

  it('applies dark mode styles correctly', () => {
    const { container } = renderComponent(true);
    expect(container.firstChild).toHaveClass('bg-gray-900', 'text-white');
  });
});
