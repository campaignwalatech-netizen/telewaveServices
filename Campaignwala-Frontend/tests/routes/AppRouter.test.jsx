
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppRouter from '../../src/routes/AppRouter';

// Mock Redux store
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Mock all the page components
vi.mock('../../src/pages/auth/LoginPage', () => ({ default: () => <div>LoginPage</div> }));
vi.mock('../../src/pages/auth/RegisterPage', () => ({ default: () => <div>RegisterPage</div> }));
vi.mock('../../src/pages/auth/OtpVerification', () => ({ default: () => <div>OtpVerificationPage</div> }));
vi.mock('../../src/App', () => ({ default: () => <div>AdminLayout</div> }));
vi.mock('../../src/userDashboard/pages', () => ({
    UserDashboardLayout: () => <div>UserDashboardLayout</div>
}));
vi.mock('../../src/pages/error/NotFoundPage', () => ({ default: () => <div>NotFoundPage</div> }));
vi.mock('../../src/userDashboard/pages/SharedOfferForm', () => ({ default: () => <div>SharedOfferForm</div> }));


describe('AppRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AppRouter />
      </MemoryRouter>
    );
  };

  describe('Public Routes', () => {
    beforeEach(() => {
        useSelector.mockReturnValue(false); // Not authenticated
    });

    it('should render LoginPage for the root route', () => {
      renderWithRouter(['/']);
      expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });

    it('should render RegisterPage for the /register route', () => {
      renderWithRouter(['/register']);
      expect(screen.getByText('RegisterPage')).toBeInTheDocument();
    });

    it('should render the public share form', () => {
        renderWithRouter(['/share/offer123/user456']);
        expect(screen.getByText('SharedOfferForm')).toBeInTheDocument();
    });
  });

  describe('Admin Routes', () => {
    it('should redirect guest from admin routes to login', () => {
        useSelector.mockReturnValue(false); // Not authenticated
        renderWithRouter(['/admin/all-offers']);
        expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });

    it('should redirect non-admin user from admin routes', () => {
        useSelector.mockImplementation(selector => {
            if (selector.name === 'selectIsAuthenticated') return true;
            if (selector.name === 'selectUserRole') return 'user';
            return null;
        });
        renderWithRouter(['/admin/all-offers']);
        // In this setup, it redirects to the user's dashboard
        expect(screen.getByText('UserDashboardLayout')).toBeInTheDocument();
    });

    it('should allow admin user to access admin routes', () => {
        useSelector.mockImplementation(selector => {
            if (selector.name === 'selectIsAuthenticated') return true;
            if (selector.name === 'selectUserRole') return 'admin';
            return null;
        });
        renderWithRouter(['/admin/all-offers']);
        expect(screen.getByText('AdminLayout')).toBeInTheDocument();
    });
  });

  describe('User Routes', () => {
    it('should redirect guest from user routes to login', () => {
        useSelector.mockReturnValue(false); // Not authenticated
        renderWithRouter(['/user/dashboard']);
        expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });

    it('should redirect admin user from user routes', () => {
        useSelector.mockImplementation(selector => {
            if (selector.name === 'selectIsAuthenticated') return true;
            if (selector.name === 'selectUserRole') return 'admin';
            return null;
        });
        renderWithRouter(['/user/dashboard']);
        // In this setup, it redirects to the admin's dashboard
        expect(screen.getByText('AdminLayout')).toBeInTheDocument();
    });

    it('should allow user to access user routes', () => {
        useSelector.mockImplementation(selector => {
            if (selector.name === 'selectIsAuthenticated') return true;
            if (selector.name === 'selectUserRole') return 'user';
            return null;
        });
        renderWithRouter(['/user/dashboard']);
        expect(screen.getByText('UserDashboardLayout')).toBeInTheDocument();
    });
  });

  describe('Fallback Route', () => {
    it('should redirect to login page for a non-existent route', () => {
        renderWithRouter(['/some/random/path']);
        expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });
  });
});
