
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from '../../src/routes/PrivateRoute';
import Loader from '../../src/components/Loader';
import { selectIsAuthenticated, selectIsLoading } from '../../src/redux/slices/authSlice';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('../../src/redux/slices/authSlice', () => ({
    selectIsAuthenticated: vi.fn(),
    selectIsLoading: vi.fn(),
    selectHasPermission: vi.fn((permission) => permission),
}));

vi.mock('../../src/components/Loader', () => ({
    default: () => <div>Loading...</div>
}));

const PrivateContent = () => <div>Private Content</div>;
const LoginPage = () => <div>LoginPage</div>;
const UnauthorizedPage = () => <div>UnauthorizedPage</div>;

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderInRouter = (initialEntries, requiredPermissions) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route 
            path="/private" 
            element={
              <PrivateRoute requiredPermissions={requiredPermissions}>
                <PrivateContent />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render loader when auth state is loading', () => {
    useSelector.mockImplementation(selector => selector.name === 'selectIsLoading');
    renderInRouter(['/private'], []);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login if user is not authenticated', () => {
    useSelector.mockReturnValue(false);
    renderInRouter(['/private'], []);
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('Private Content')).not.toBeInTheDocument();
  });

  it('should render children if user is authenticated and no permissions are required', () => {
    useSelector.mockImplementation(selector => selector.name !== 'selectIsLoading');
    renderInRouter(['/private'], []);
    expect(screen.getByText('Private Content')).toBeInTheDocument();
  });

  it('should render children if user has the required permission', () => {
    useSelector.mockImplementation(selector => {
        if (selector.name === 'selectIsAuthenticated') return true;
        if (selector.name === 'selectIsLoading') return false;
        // For the permission check
        if (typeof selector === 'string' && selector === 'can_view') return true;
        return false;
    });

    renderInRouter(['/private'], ['can_view']);
    expect(screen.getByText('Private Content')).toBeInTheDocument();
  });

  it('should redirect to unauthorized if user lacks a required permission', () => {
    useSelector.mockImplementation(selector => {
        if (selector.name === 'selectIsAuthenticated') return true;
        if (selector.name === 'selectIsLoading') return false;
        // Mock having one permission but not the other
        if (typeof selector === 'string' && selector === 'can_view') return true;
        if (typeof selector === 'string' && selector === 'can_edit') return false;
        return false;
    });

    renderInRouter(['/private'], ['can_view', 'can_edit']);
    expect(screen.getByText('UnauthorizedPage')).toBeInTheDocument();
    expect(screen.queryByText('Private Content')).not.toBeInTheDocument();
  });
});
