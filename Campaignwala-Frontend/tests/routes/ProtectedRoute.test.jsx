
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useSelector } from 'react-redux';

// Mock Redux's useSelector
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

// Mock components
const MockLoader = () => <div>Loading...</div>;
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const UnauthorizedComponent = () => <div>Unauthorized Page</div>;
const UserDashboard = () => <div>User Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = '/', initialState } = {}) => {
    useSelector.mockImplementation((selector) => initialState[selector.name]);
    window.history.pushState({}, 'Test page', route);

    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/unauthorized" element={<UnauthorizedComponent />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/protected" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loader when isLoading is true', () => {
    const initialState = {
      selectIsLoading: true,
      selectIsAuthenticated: false,
      selectUserRole: null,
    };

    renderWithRouter(
      <ProtectedRoute fallback={<MockLoader />}>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to login page', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: false,
      selectUserRole: null,
    };

    renderWithRouter(
      <ProtectedRoute redirectTo="/login">
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for authenticated user with no role requirement', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: true,
      selectUserRole: 'user',
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children for authenticated user with allowed role', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: true,
      selectUserRole: 'admin',
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin', 'moderator']}>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects user with incorrect role to their dashboard', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: true,
      selectUserRole: 'user',
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('redirects user with unknown role to unauthorized page', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: true,
      selectUserRole: 'guest',
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={['admin']}>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders children if requireAuth is false, even if unauthenticated', () => {
    const initialState = {
      selectIsLoading: false,
      selectIsAuthenticated: false,
      selectUserRole: null,
    };

    renderWithRouter(
      <ProtectedRoute requireAuth={false}>
        <ProtectedComponent />
      </ProtectedRoute>,
      { route: '/protected', initialState }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
