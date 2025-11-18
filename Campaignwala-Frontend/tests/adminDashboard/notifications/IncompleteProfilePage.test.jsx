
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IncompleteProfilePage from '../../../src/adminDashboard/notifications/IncompleteProfilePage';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('IncompleteProfilePage Component', () => {
  it('should render the page with initial elements', () => {
    render(<IncompleteProfilePage />);
    expect(screen.getByText('Incomplete Profile Notifications')).toBeInTheDocument();
    expect(screen.getByText('Incomplete Profile Users (5)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByText(/Send to/)).toBeDisabled();
  });

  it('should filter users based on search query', () => {
    render(<IncompleteProfilePage />);
    const searchInput = screen.getByPlaceholderText('Search users...');

    fireEvent.change(searchInput, { target: { value: 'Rajesh' } });

    expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument();
  });

  it('should filter users by priority', () => {
    render(<IncompleteProfilePage />);
    const filterSelect = screen.getByRole('combobox');

    fireEvent.change(filterSelect, { target: { value: 'high' } });

    expect(screen.getByText('Amit Patel')).toBeInTheDocument(); // 45% completion
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument(); // 75% completion
  });

  it('should select and deselect a user', () => {
    render(<IncompleteProfilePage />);
    const user = screen.getByText('Rajesh Kumar').closest('div.p-4');

    fireEvent.click(user);
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    fireEvent.click(user);
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  });

  it('should enable the send button when form is valid and users are selected', () => {
    render(<IncompleteProfilePage />);
    const titleInput = screen.getByLabelText('Title');
    const messageInput = screen.getByLabelText('Message');
    const user = screen.getByText('Rajesh Kumar').closest('div.p-4');

    fireEvent.change(titleInput, { target: { value: 'Complete your profile' } });
    fireEvent.change(messageInput, { target: { value: 'Please complete your profile.' } });
    fireEvent.click(user);

    expect(screen.getByText(/Send to 1 Users/)).toBeEnabled();
  });

  it('should show success message after sending', async () => {
    render(<IncompleteProfilePage />);
    const titleInput = screen.getByLabelText('Title');
    const messageInput = screen.getByLabelText('Message');
    const user = screen.getByText('Rajesh Kumar').closest('div.p-4');
    const sendButton = screen.getByText(/Send to/);

    fireEvent.change(titleInput, { target: { value: 'Complete your profile' } });
    fireEvent.change(messageInput, { target: { value: 'Please complete your profile.' } });
    fireEvent.click(user);
    fireEvent.click(sendButton);

    expect(await screen.findByText('✓ Sent to 1 users!')).toBeInTheDocument();
  });

  it('should navigate back when back button is clicked', () => {
    render(<IncompleteProfilePage />);
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications');
  });
});
