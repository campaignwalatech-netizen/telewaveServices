
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileMenu from '../../../src/adminDashboard/components/ProfileMenu';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProfileMenu Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>
    );
  };

  it('should render the profile button', () => {
    renderComponent();
    expect(screen.getByLabelText('Profile menu')).toBeInTheDocument();
  });

  it('should open and close the dropdown menu', () => {
    renderComponent();
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);
    expect(screen.getByText('Admin User')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('should handle the logout action', () => {
    renderComponent();
    const button = screen.getByLabelText('Profile menu');
    fireEvent.click(button);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
