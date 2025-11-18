
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar from '../../../src/adminDashboard/components/AdminSidebar';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('AdminSidebar Component', () => {
  const setSidebarOpen = vi.fn();
  const handleLogout = vi.fn();

  const renderComponent = (path = '/') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <AdminSidebar
          sidebarOpen={true}
          setSidebarOpen={setSidebarOpen}
          userPhone="1234567890"
          handleLogout={handleLogout}
        />
      </MemoryRouter>
    );
  };

  it('should render the sidebar with logo, menu, and user info', () => {
    renderComponent();
    expect(screen.getByText('Campaign')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should call navigation and close sidebar on menu item click', () => {
    renderComponent();
    const usersLink = screen.getByText('Users');
    fireEvent.click(usersLink);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('should call handleLogout on logout button click', () => {
    renderComponent();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('should close the sidebar when the close button is clicked', () => {
    renderComponent();
    const closeButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(closeButton);
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });
});
