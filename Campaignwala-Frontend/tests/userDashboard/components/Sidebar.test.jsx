
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../../src/userDashboard/components/Sidebar';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockUseLocation(),
    };
});

describe('User Dashboard Sidebar Component', () => {
  let toggleSidebar;

  beforeEach(() => {
    vi.clearAllMocks();
    toggleSidebar = vi.fn();
    mockUseLocation.mockReturnValue({ pathname: '/user' }); // Default location
  });

  const renderComponent = (isSidebarOpen = true, darkMode = false) => {
    return render(
      <MemoryRouter>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode} 
        />
      </MemoryRouter>
    );
  };

  it('should render all menu items with text when open', () => {
    renderComponent(true);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Leads')).toBeInTheDocument();
    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should only render icons when collapsed', () => {
    renderComponent(false);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('All Leads')).not.toBeInTheDocument();
    // Check for presence of icons by title
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
    expect(screen.getByTitle('All Leads')).toBeInTheDocument();
  });

  it('should call toggleSidebar when the collapse button is clicked', () => {
    renderComponent(true);
    const collapseButton = screen.getByRole('button', { name: '' }); // Poor selector
    fireEvent.click(collapseButton);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should call navigate when a menu item is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('All Leads'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/all-leads');

    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/profile-overview');
  });

  it('should apply active styles to the current route\'s menu item', () => {
    mockUseLocation.mockReturnValue({ pathname: '/user/wallet-withdrawl' });
    renderComponent();
    const walletButton = screen.getByRole('button', { name: /wallet/i });
    // Check for a class that indicates active state
    expect(walletButton).toHaveClass('border-blue-600');
  });

  it('should not apply active styles to inactive menu items', () => {
    mockUseLocation.mockReturnValue({ pathname: '/user/wallet-withdrawl' });
    renderComponent();
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardButton).not.toHaveClass('border-blue-600');
  });

  it('should apply dark mode classes when darkMode is true', () => {
    const { container } = renderComponent(true, true);
    expect(container.firstChild).toHaveClass('bg-gray-900');
  });
});
