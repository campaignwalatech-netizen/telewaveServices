
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersTable from '../../../../src/adminDashboard/forms/UsersTable';
import userService from '../../../../src/services/userService';

// Mock services
vi.mock('../../../../src/services/userService');

describe('UsersTable Component', () => {
  const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@example.com', phone: '111', status: 'Active', isActive: true, isEx: false, totalLeads: 40, joinedOn: '2023-01-01' },
    { id: '2', name: 'Bob', email: 'bob@example.com', phone: '222', status: 'Hold', isActive: false, isEx: false, totalLeads: 20, joinedOn: '2023-01-02' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', phone: '333', status: 'Ex', isActive: false, isEx: true, totalLeads: 5, joinedOn: '2023-01-03' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    userService.getAllUsersWithStats.mockResolvedValue({ success: true, data: { users: mockUsers, pagination: { total: 3 } } });
    userService.toggleUserStatus.mockResolvedValue({ success: true });
    userService.markUserAsEx.mockResolvedValue({ success: true });
  });

  const renderComponent = (userType) => {
    return render(<UsersTable userType={userType} />);
  };

  it('should render active users correctly', async () => {
    renderComponent('active');
    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
  });

  it('should render hold users correctly', async () => {
    renderComponent('hold');
    await waitFor(() => {
      expect(screen.getByText('On Hold Users')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
  });

  it('should open the view modal on "View" click', async () => {
    renderComponent('active');
    await waitFor(() => screen.getByText('Alice'));
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(screen.getByText('View User Details')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('should open the edit modal on "Edit" click', async () => {
    renderComponent('active');
    await waitFor(() => screen.getByText('Alice'));
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  // Hover and status change tests are difficult with RTL because of the hover-based UI.
  // We would need a different testing approach (like Cypress) for better coverage of these interactions.
});
