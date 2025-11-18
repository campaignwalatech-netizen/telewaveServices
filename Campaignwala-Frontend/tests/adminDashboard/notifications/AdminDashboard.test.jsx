
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from '../../../src/adminDashboard/notifications/AdminDashboard';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('AdminDashboard Component', () => {
  it('should render the dashboard with all sections', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Notification Center')).toBeInTheDocument();
    expect(screen.getByText('Incomplete Profile')).toBeInTheDocument();
    expect(screen.getByText('Hot Offers')).toBeInTheDocument();
    expect(screen.getByText('Notification History')).toBeInTheDocument();
    expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
  });

  it('should navigate to incomplete profile page on click', () => {
    render(<AdminDashboard />);
    const incompleteProfileCard = screen.getByText('Incomplete Profile').closest('button');
    fireEvent.click(incompleteProfileCard);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications/incomplete-profile');
  });

  it('should navigate to hot offers page on click', () => {
    render(<AdminDashboard />);
    const hotOffersCard = screen.getByText('Hot Offers').closest('button');
    fireEvent.click(hotOffersCard);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications/hot-offers');
  });

  it('should navigate to history page on click', () => {
    render(<AdminDashboard />);
    const historyButton = screen.getByText('Notification History').closest('button');
    fireEvent.click(historyButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications/history');
  });

  it('should display recent notifications', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Profile Completion Reminder')).toBeInTheDocument();
    expect(screen.getByText('Summer Sale - 50% Off')).toBeInTheDocument();
    expect(screen.getByText('New Feature Announcement')).toBeInTheDocument();
  });
});
