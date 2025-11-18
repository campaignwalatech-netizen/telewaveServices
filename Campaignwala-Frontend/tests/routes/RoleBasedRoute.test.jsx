
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleBasedRoute from '../../src/routes/RoleBasedRoute';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const AdminContent = () => <div>Admin Content</div>;
const UserContent = () => <div>User Content</div>;
const LoginPage = () => <div>LoginPage</div>;
const UserDashboard = () => <div>UserDashboard</div>;
const AdminDashboard = () => <div>AdminDashboard</div>;

describe('RoleBasedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderInRouter = (initialEntries, role) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <RoleBasedRoute role={role}>
                {role === 'admin' ? <AdminContent /> : <UserContent />}
              </RoleBasedRoute>
            }
          />
          <Route path="/" element={<LoginPage />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render children if user has the correct role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'admin';
      return null;
    });

    renderInRouter(['/protected'], 'admin');
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect to login if user is not authenticated', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return false;
      return null;
    });

    renderInRouter(['/protected'], 'admin');
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to their own dashboard if user has the wrong role', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'user'; // User tries to access an admin route
      return null;
    });

    renderInRouter(['/protected'], 'admin');
    // Should be redirected to the user dashboard
    expect(screen.getByText('UserDashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect admin to their dashboard if they access a user route', () => {
    useSelector.mockImplementation(selector => {
      if (selector.name === 'selectIsAuthenticated') return true;
      if (selector.name === 'selectUserRole') return 'admin'; // Admin tries to access a user route
      return null;
    });

    renderInRouter(['/protected'], 'user');
    // Should be redirected to the admin dashboard
    expect(screen.getByText('AdminDashboard')).toBeInTheDocument();
    expect(screen.queryByText('User Content')).not.toBeInTheDocument();
  });
});
