
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApprovedLeads from '../../../src/userDashboard/layouts/ApprovedLeads';

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

describe('ApprovedLeads Layout', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/user/approved-leads' });
  });

  const renderComponent = (darkMode = false) => {
    return render(
      <MemoryRouter initialEntries={['/user/approved-leads']}>
        <ApprovedLeads darkMode={darkMode} />
      </MemoryRouter>
    );
  };

  it('should render the page title, filters, and tabs', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /approved leads/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name or offer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approved leads/i })).toHaveClass('bg-blue-600');
  });

  it('should display all leads initially', () => {
    renderComponent();
    // All 5 hardcoded leads should be in the table
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 1 header row + 5 data rows
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Michael Brown')).toBeInTheDocument();
  });

  it('should filter leads by category', () => {
    renderComponent();
    const categoryFilter = screen.getByRole('combobox');

    fireEvent.change(categoryFilter, { target: { value: 'HDFC Bank' } });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 header row + 1 data row
    expect(screen.getByText('Michael Brown')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });

  it('should filter leads by search query', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search by name or offer/i);

    fireEvent.change(searchInput, { target: { value: 'Emily' } });

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('Emily Davis')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
  });

  it('should show a message when no leads are found', () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search by name or offer/i);

    fireEvent.change(searchInput, { target: { value: 'NonExistentName' } });

    expect(screen.getByText(/no approved leads found/i)).toBeInTheDocument();
  });

  it('should navigate when a tab is clicked', () => {
    renderComponent();
    const pendingTab = screen.getByRole('button', { name: /pending leads/i });
    fireEvent.click(pendingTab);
    expect(mockNavigate).toHaveBeenCalledWith('/user/pending-leads');

    const rejectedTab = screen.getByRole('button', { name: /rejected leads/i });
    fireEvent.click(rejectedTab);
    expect(mockNavigate).toHaveBeenCalledWith('/user/rejected-leads');
  });
});
