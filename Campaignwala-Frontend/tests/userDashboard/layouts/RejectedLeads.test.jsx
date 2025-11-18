import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RejectedLeads from '../../../src/userDashboard/layouts/RejectedLeads';

// Mock the useNavigate and useLocation hooks
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({ pathname: '/user/rejected-leads' }),
  };
});

describe('RejectedLeads Component', () => {
  it('should render the component with initial data', () => {
    render(
      <MemoryRouter>
        <RejectedLeads darkMode={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Rejected Leads')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should filter leads by category', () => {
    render(
      <MemoryRouter>
        <RejectedLeads darkMode={false} />
      </MemoryRouter>
    );

    const categoryFilter = screen.getByRole('combobox');
    fireEvent.change(categoryFilter, { target: { value: 'Axis Bank' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should filter leads by search query', () => {
    render(
      <MemoryRouter>
        <RejectedLeads darkMode={false} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by name, offer, or contact...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should navigate to the correct tabs', () => {
    render(
      <MemoryRouter>
        <RejectedLeads darkMode={false} />
      </MemoryRouter>
    );

    const pendingTab = screen.getByText(/Pending Leads/i);
    fireEvent.click(pendingTab);
    expect(mockedNavigate).toHaveBeenCalledWith('/user/pending-leads');

    const approvedTab = screen.getByText(/Approved Leads/i);
    fireEvent.click(approvedTab);
    expect(mockedNavigate).toHaveBeenCalledWith('/user/approved-leads');
  });

  it('should render in dark mode', () => {
    render(
      <MemoryRouter>
        <RejectedLeads darkMode={true} />
      </MemoryRouter>
    );

    const mainDiv = screen.getByText('Rejected Leads').closest('div.min-h-screen');
    expect(mainDiv).toHaveClass('bg-gray-900', 'text-white');
  });
});