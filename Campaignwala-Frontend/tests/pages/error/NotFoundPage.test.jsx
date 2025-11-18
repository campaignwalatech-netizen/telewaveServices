
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFoundPage from '../../../src/pages/error/NotFoundPage';
import { DEFAULT_REDIRECTS } from '../../../src/routes/routeConstants';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(<NotFoundPage />, { wrapper: MemoryRouter });
  };

  it('should render the 404 page with correct content', () => {
    useSelector.mockReturnValue(false); // Not authenticated
    renderWithRouter();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: /go to home/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.guest);
  });

  it('should navigate to user dashboard for authenticated user role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'user';
      return null;
    });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go to home/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.user);
  });

  it('should navigate to admin dashboard for authenticated admin role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'admin';
      return null;
    });

    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /go to home/i }));
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_REDIRECTS.admin);
  });
});
