
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeadsTable from '../../../src/adminDashboard/forms/LeadsTable';
import leadService from '../../../src/services/leadService';

// Mock services
vi.mock('../../../src/services/leadService');

describe('LeadsTable Component', () => {
  const mockLeads = [
    { _id: '1', leadId: 'LD001', offerName: 'Offer 1', category: 'Cat A', status: 'pending', createdAt: new Date().toISOString() },
    { _id: '2', leadId: 'LD002', offerName: 'Offer 2', category: 'Cat B', status: 'pending', createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    leadService.getAllLeads.mockResolvedValue({ success: true, data: { leads: mockLeads } });
    leadService.getLeadStats.mockResolvedValue({ success: true, data: { pending: 2, approved: 0, completed: 0, rejected: 0 } });
    leadService.approveLead.mockResolvedValue({ success: true, message: 'Lead approved' });
  });

  const renderComponent = (status = 'pending') => {
    return render(<LeadsTable status={status} />);
  };

  it('should render the table with a dynamic title and leads', async () => {
    renderComponent('pending');
    expect(screen.getByText('Pending Leads')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Offer 1')).toBeInTheDocument();
      expect(screen.getByText('Offer 2')).toBeInTheDocument();
    });
  });

  it('should open the view modal on "View" click', async () => {
    renderComponent();
    await waitFor(() => screen.getByText('Offer 1'));

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    expect(screen.getByText('View Lead Details')).toBeInTheDocument();
    expect(screen.getByText('LD001')).toBeInTheDocument();
  });

  it('should allow changing the status of a lead', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderComponent();
    await waitFor(() => screen.getByText('Offer 1'));

    const statusDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(statusDropdowns[0], { target: { value: 'approved' } });

    await waitFor(() => {
      expect(leadService.approveLead).toHaveBeenCalledWith('1');
      expect(alertSpy).toHaveBeenCalledWith('Lead approved');
    });
    alertSpy.mockRestore();
  });

  it('should filter leads based on search term', async () => {
    renderComponent();
    await waitFor(() => expect(leadService.getAllLeads).toHaveBeenCalledTimes(1));

    const searchInput = screen.getByPlaceholderText(/search by id/i);
    fireEvent.change(searchInput, { target: { value: 'LD001' } });

    await waitFor(() => {
      expect(leadService.getAllLeads).toHaveBeenCalledTimes(2);
      expect(leadService.getAllLeads).toHaveBeenCalledWith(expect.objectContaining({ search: 'LD001' }));
    });
  });

  it('should display an error message if fetching leads fails', async () => {
    leadService.getAllLeads.mockResolvedValue({ success: false, message: 'Failed to fetch leads' });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch leads')).toBeInTheDocument();
    });
  });
});
