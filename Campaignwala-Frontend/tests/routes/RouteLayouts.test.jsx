
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { 
    AdminRouteLayout,
    UserRouteLayout,
    AuthenticatedRouteLayout 
} from '../../src/routes/RouteLayouts';
import ProtectedRoute from '../../src/routes/ProtectedRoute';

// Mock the ProtectedRoute component to inspect its props
vi.mock('../../src/routes/ProtectedRoute', () => ({
  default: vi.fn(({ children }) => children),
}));

describe('RouteLayouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ChildComponent = () => <div>Child Content</div>;

  it('AdminRouteLayout should wrap content in a ProtectedRoute for admins', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AdminRouteLayout />}>
            <Route path="/" element={<ChildComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(ProtectedRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedRoles: ['admin'],
        redirectTo: '/unauthorized',
      }),
      {}
    );
  });

  it('UserRouteLayout should wrap content in a ProtectedRoute for users', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<UserRouteLayout />}>
            <Route path="/" element={<ChildComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(ProtectedRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedRoles: ['user'],
        redirectTo: '/unauthorized',
      }),
      {}
    );
  });

  it('AuthenticatedRouteLayout should wrap content in a ProtectedRoute requiring auth', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AuthenticatedRouteLayout />}>
            <Route path="/" element={<ChildComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(ProtectedRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAuth: true,
        redirectTo: '/',
      }),
      {}
    );
  });
});
