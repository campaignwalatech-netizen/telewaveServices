
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UnauthorizedPage from '../../../src/pages/error/UnauthorizedPage';
import { DEFAULT_REDIRECTS } from '../../../src/routes/routeConstants';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

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

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ state: null }); // Default location state
  });

  const renderWithRouter = () => {
    return render(<UnauthorizedPage />, { wrapper: MemoryRouter });
  };

  it('should render the unauthorized page with correct content', () => {
    useSelector.mockReturnValue(false); // Not authenticated
    renderWithRouter();

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.getByText(/you don't have permission/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('should display the attempted path if passed in location state', () => {
    mockUseLocation.mockReturnValue({ state: { from: '/admin/secret' } });
    renderWithRouter();
    expect(screen.getByText(/attempted to access:/i)).toBeInTheDocument();
    expect(screen.getByText('/admin/secret')).toBeInTheDocument();
  });

  it('should navigate back when "Go Back" is clicked', () => {
    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should navigate to guest home for unauthenticated users', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return false;
      return null;
    });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.guest);
  });

  it('should navigate to user dashboard for authenticated user role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'user';
      return null;
    });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.user);
  });

  it('should navigate to admin dashboard for authenticated admin role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'admin';
      return null;
    });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.admin);
  });
});
