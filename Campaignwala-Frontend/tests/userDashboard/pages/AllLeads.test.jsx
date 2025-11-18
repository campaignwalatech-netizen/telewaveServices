
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AllLeads from '../../../src/userDashboard/pages/AllLeads';

// Mock the useNavigate and useOutletContext hooks
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useOutletContext: () => false, // Mocking darkMode context
  };
});

describe('AllLeads Component', () => {
  it('should render the component with initial data', () => {
    render(
      <MemoryRouter>
        <AllLeads />
      </MemoryRouter>
    );

    expect(screen.getByText('All Leads')).toBeInTheDocument();
    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });

  it('should filter leads by category', () => {
    render(
      <MemoryRouter>
        <AllLeads />
      </MemoryRouter>
    );

    const categoryFilter = screen.getByRole('combobox');
    fireEvent.change(categoryFilter, { target: { value: 'DEMAT Account' } });

    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument();
  });

  it('should filter leads by search query', () => {
    render(
      <MemoryRouter>
        <AllLeads />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or contact...');
    fireEvent.change(searchInput, { target: { value: 'Priya' } });

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.queryByText('Ravi Kumar')).not.toBeInTheDocument();
  });

  it('should navigate to the correct tabs', () => {
    render(
      <MemoryRouter>
        <AllLeads />
      </MemoryRouter>
    );

    const pendingTab = screen.getByText('Pending Leads');
    fireEvent.click(pendingTab);
    expect(mockedNavigate).toHaveBeenCalledWith('/user/pending-leads');

    const approvedTab = screen.getByText('Approved Leads');
    fireEvent.click(approvedTab);
    expect(mockedNavigate).toHaveBeenCalledWith('/user/approved-leads');

    const rejectedTab = screen.getByText('Rejected Leads');
    fireEvent.click(rejectedTab);
    expect(mockedNavigate).toHaveBeenCalledWith('/user/rejected-leads');
  });
});
