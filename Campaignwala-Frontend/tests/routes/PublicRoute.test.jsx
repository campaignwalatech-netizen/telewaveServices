
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicRoute from '../../src/routes/PublicRoute';
import Loader from '../../src/components/Loader';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('../../src/components/Loader', () => ({
    default: () => <div>Loading...</div>
}));

const TestComponent = () => <div>Public Content</div>;
const DashboardComponent = () => <div>Dashboard</div>;

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderInRouter = (initialEntries = ['/public']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route 
            path="/public" 
            element={
              <PublicRoute>
                <TestComponent />
              </PublicRoute>
            }
          />
          <Route path="/admin" element={<DashboardComponent />} />
          <Route path="/user" element={<DashboardComponent />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render children if user is not authenticated', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return false;
      if (selector.name === 'selectIsLoading') return false;
      return null;
    });

    renderInRouter();
    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should redirect authenticated admin user to admin dashboard', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'admin';
      if (selector.name === 'selectIsLoading') return false;
      return null;
    });

    renderInRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });

  it('should redirect authenticated user to user dashboard', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'user';
      if (selector.name === 'selectIsLoading') return false;
      return null;
    });

    renderInRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });

  it('should render loader when auth state is loading', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsLoading') return true;
      return null;
    });

    renderInRouter();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });

  it('should render children for authenticated user if restricted is false', () => {
    useSelector.mockImplementation(selector => {
        if (selector.name === 'selectIsAuthenticated') return true;
        if (selector.name === 'selectIsLoading') return false;
        return null;
      });
  
      render(
        <MemoryRouter initialEntries={['/public-unrestricted']}>
          <Routes>
            <Route 
              path="/public-unrestricted" 
              element={
                <PublicRoute restricted={false}>
                  <TestComponent />
                </PublicRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
  });
});
