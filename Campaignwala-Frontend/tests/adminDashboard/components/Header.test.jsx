
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../../src/adminDashboard/components/Header.jsx';
import userService from '../../../src/services/userService';

// Mock dependencies
vi.mock('../../../src/services/userService');
vi.mock('../../../src/adminDashboard/components/ProfileMenu', () => ({
  default: () => <div data-testid="profile-menu">Profile Menu</div>,
}));

describe('Header Component', () => {
  const onThemeToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (path = '/') => {
    return render(
      <MemoryRouter initialEntries={[`/admin${path}`]}>
        <Header isDark={false} onThemeToggle={onThemeToggle} />
      </MemoryRouter>
    );
  };

  it('should render the default title for the root path', async () => {
    userService.getAllUsersWithStats.mockResolvedValue({ success: true, data: { users: [] } });
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('ALL Offers')).toBeInTheDocument();
  });

  it('should render a dynamic title based on the path', async () => {
    userService.getAllUsersWithStats.mockResolvedValue({ success: true, data: { users: [] } });
    await act(async () => {
      renderComponent('/users');
    });
    expect(screen.getByText('USERS')).toBeInTheDocument();
  });

  it('should fetch and display the active users count', async () => {
    const mockUsers = [
      { isActive: true },
      { isActive: true },
      { isActive: false },
    ];
    userService.getAllUsersWithStats.mockResolvedValue({ success: true, data: { users: mockUsers } });
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('2 active users')).toBeInTheDocument();
  });

  it('should display "1 active user" for a single active user', async () => {
    userService.getAllUsersWithStats.mockResolvedValue({ success: true, data: { users: [{ isActive: true }] } });
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('1 active user')).toBeInTheDocument();
  });

  it('should handle API failure gracefully', async () => {
    userService.getAllUsersWithStats.mockRejectedValue(new Error('API Error'));
    await act(async () => {
      renderComponent();
    });
    expect(screen.getByText('0 active users')).toBeInTheDocument();
  });
});
