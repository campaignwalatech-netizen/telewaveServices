
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryPage from '../../../src/adminDashboard/notifications/HistoryPage';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('HistoryPage Component', () => {
  it('should render the page with initial elements', () => {
    render(<HistoryPage />);
    expect(screen.getByText('Notification History')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Select a notification to view details')).toBeInTheDocument();
  });

  it('should filter notifications by search query', () => {
    render(<HistoryPage />);
    const searchInput = screen.getByPlaceholderText('Search notifications...');

    fireEvent.change(searchInput, { target: { value: 'Summer Sale' } });

    expect(screen.getByText('Summer Sale - 50% Off')).toBeInTheDocument();
    expect(screen.queryByText('Profile Completion Reminder')).not.toBeInTheDocument();
  });

  it('should filter notifications by type', () => {
    render(<HistoryPage />);
    const offerFilterButton = screen.getByText('Offers');

    fireEvent.click(offerFilterButton);

    expect(screen.getByText('Summer Sale - 50% Off')).toBeInTheDocument();
    expect(screen.queryByText('Profile Completion Reminder')).not.toBeInTheDocument();
  });

  it('should display notification details on selection', () => {
    render(<HistoryPage />);
    const notification = screen.getByText('Profile Completion Reminder').closest('button');

    fireEvent.click(notification);

    expect(screen.getByText('TYPE')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('RECIPIENTS')).toBeInTheDocument();
    expect(screen.getByText('234')).toBeInTheDocument();
  });

  it('should delete a notification', () => {
    render(<HistoryPage />);
    let notification = screen.getByText('Profile Completion Reminder').closest('button');

    fireEvent.click(notification);

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Profile Completion Reminder')).not.toBeInTheDocument();
    expect(screen.getByText('Select a notification to view details')).toBeInTheDocument();
  });

  it('should navigate back when back button is clicked', () => {
    render(<HistoryPage />);
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications');
  });
});
