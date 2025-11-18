
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../../../src/adminDashboard/pages/DashboardPage';

// Mock hooks and components
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../../src/context-api/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../../../src/adminDashboard/components/AdminSidebar', () => ({
  default: ({ handleLogout }) => (
    <div>
      <span>AdminSidebar</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ),
}));

vi.mock('../../../src/adminDashboard/components/AdminHeader', () => ({
  default: () => <div>AdminHeader</div>,
}));

vi.mock('../../../src/adminDashboard/components/StatsCard', () => ({
  default: ({ stat }) => <div>{stat.title}</div>,
}));

vi.mock('../../../src/adminDashboard/components/ActivityFeed', () => ({
  default: () => <div>ActivityFeed</div>,
}));

describe('DashboardPage Component', () => {
  beforeEach(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('userPhone', '1234567890');
  });

  it('should render the dashboard with all components', () => {
    render(<DashboardPage />);
    expect(screen.getByText('AdminSidebar')).toBeInTheDocument();
    expect(screen.getByText('AdminHeader')).toBeInTheDocument();
    expect(screen.getByText('Sales Overview')).toBeInTheDocument();
    expect(screen.getByText('ActivityFeed')).toBeInTheDocument();
  });

  it('should render all stats cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    expect(screen.getByText('New Leads')).toBeInTheDocument();
  });

  it('should call handleLogout and navigate on logout button click', () => {
    render(<DashboardPage />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(localStorage.getItem('userPhone')).toBeNull();
    expect(localStorage.getItem('userType')).toBeNull();
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('should redirect if not logged in as admin', () => {
    localStorage.removeItem('isLoggedIn');
    render(<DashboardPage />);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });
});
