
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProfileOverview from '../../../src/userDashboard/layouts/ProfileOverview';

// Mock the useNavigate hook
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('ProfileOverview Component', () => {
  it('should render the component with default props (light mode)', () => {
    render(
      <MemoryRouter>
        <ProfileOverview darkMode={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Profile Settings Overview')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@campaignwaala.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('KYC Verification Status')).toBeInTheDocument();
    expect(screen.getByText('Pending Review by Admin')).toBeInTheDocument();
    expect(screen.getByText('Update Profile / KYC')).toBeInTheDocument();
    expect(screen.getByText('YOUR CAMPAIGN WAALA CARD')).toBeInTheDocument();
  });

  it('should render the component in dark mode', () => {
    render(
      <MemoryRouter>
        <ProfileOverview darkMode={true} />
      </MemoryRouter>
    );

    // Check for a class that is specific to dark mode
    const mainDiv = screen.getByText('Profile Settings Overview').closest('div');
    expect(mainDiv).toHaveClass('bg-gray-900', 'text-white');
  });

  it('should navigate to the KYC details page when the button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/user/profile-overview']}>
        <Routes>
          <Route path="/user/profile-overview" element={<ProfileOverview darkMode={false} />} />
          <Route path="/user/kyc-details" element={<div>KYC Details Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const updateButton = screen.getByText('Update Profile / KYC');
    fireEvent.click(updateButton);

    expect(mockedNavigate).toHaveBeenCalledWith('/user/kyc-details');
  });
});
