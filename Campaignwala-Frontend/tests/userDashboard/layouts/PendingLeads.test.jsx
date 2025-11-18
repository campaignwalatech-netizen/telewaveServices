
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PendingLeads from '../../../src/userDashboard/layouts/PendingLeads';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockUseLocation(),
    };
});

describe('PendingLeads Layout', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/user/pending-leads' });
  });

  const renderComponent = (darkMode = false) => {
    return render(
      <MemoryRouter initialEntries={['/user/pending-leads']}>
        <PendingLeads darkMode={darkMode} />
      </MemoryRouter>
    );
  };

  it('should render the page title, filters, and tabs', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /pending leads/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or offer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending leads/i })).toHaveClass('bg-blue-600');
  });

  it('should display all leads initially', () => {
    renderComponent();
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(7); // 1 header row + 6 data rows
    expect(screen.getByText('Akash Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Singh')).toBeInTheDocument();
  });

  it('should filter leads by category', () => {
    renderComponent();
    const categoryFilter = screen.getByRole('combobox');

    fireEvent.change(categoryFilter, { target: { value: 'ICICI Bank' } });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 header row + 1 data row
    expect(screen.getByText('Rahul Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Akash Sharma')).not.toBeInTheDocument();
  });

  it('should filter leads by search query', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search by name or offer/i);

    fireEvent.change(searchInput, { target: { value: 'Sneha' } });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Sneha Gupta')).toBeInTheDocument();
    expect(screen.queryByText('Akash Sharma')).not.toBeInTheDocument();
  });

  it('should show a message when no leads are found', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search by name or offer/i);

    fireEvent.change(searchInput, { target: { value: 'NonExistentName' } });

    expect(screen.getByText(/no leads found/i)).toBeInTheDocument();
  });

  it('should navigate when a tab is clicked', () => {
    renderComponent();
    const approvedTab = screen.getByRole('button', { name: /approved leads/i });
    fireEvent.click(approvedTab);
    expect(mockNavigate).toHaveBeenCalledWith('/user/approved-leads');

    const rejectedTab = screen.getByRole('button', { name: /rejected leads/i });
    fireEvent.click(rejectedTab);
    expect(mockNavigate).toHaveBeenCalledWith('/user/rejected-leads');
  });
});
