
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PaymentWithdrawalTable from '../../../src/adminDashboard/forms/PaymentWithdrawalTable';

describe('PaymentWithdrawalTable Component', () => {
  it('should render the table with title and statistics', () => {
    render(<PaymentWithdrawalTable />);
    expect(screen.getByText('Payment Withdrawal Requests')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Approved Requests')).toBeInTheDocument();
  });

  it('should filter the table by search term', () => {
    render(<PaymentWithdrawalTable />);
    const searchInput = screen.getByPlaceholderText(/search by lead id/i);
    fireEvent.change(searchInput, { target: { value: 'LID001' } });
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Bob Williams')).not.toBeInTheDocument();
  });

  it('should filter the table by status', () => {
    render(<PaymentWithdrawalTable />);
    const statusFilter = screen.getByText('All Statuses').closest('select');
    fireEvent.change(statusFilter, { target: { value: 'Pending' } });
    expect(screen.getByText('Bob Williams')).toBeInTheDocument();
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });

  it('should open the view details modal', () => {
    render(<PaymentWithdrawalTable />);
    const viewButtons = screen.getAllByText(/view details/i);
    fireEvent.click(viewButtons[0]);
    expect(screen.getByText('Withdrawal Details')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
  });

  it('should approve a pending request from the details modal', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<PaymentWithdrawalTable />);
    // Find the 'View Details' button for the pending request
    const bobRow = screen.getByText('Bob Williams').closest('tr');
    const viewButton = bobRow.querySelector('button');
    fireEvent.click(viewButton);

    // In modal
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    const transactionIdInput = screen.getByPlaceholderText(/enter transaction id/i);
    fireEvent.change(transactionIdInput, { target: { value: 'TXN123' } });

    const confirmButton = screen.getByRole('button', { name: /confirm approval/i });
    fireEvent.click(confirmButton);

    // Check that the status is updated in the main table
    await waitFor(() => {
      const updatedRow = screen.getByText('Bob Williams').closest('tr');
      expect(updatedRow).toHaveTextContent('Approved');
      expect(updatedRow).toHaveTextContent('TXN: TXN123');
    });
    alertSpy.mockRestore();
  });

  it('should reject a pending request from the details modal', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<PaymentWithdrawalTable />);
    const bobRow = screen.getByText('Bob Williams').closest('tr');
    const viewButton = bobRow.querySelector('button');
    fireEvent.click(viewButton);

    // In modal
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    const reasonTextarea = screen.getByPlaceholderText(/enter reason for rejection/i);
    fireEvent.change(reasonTextarea, { target: { value: 'Invalid details' } });

    const confirmButton = screen.getByRole('button', { name: /confirm rejection/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      const updatedRow = screen.getByText('Bob Williams').closest('tr');
      expect(updatedRow).toHaveTextContent('Rejected');
      expect(updatedRow).toHaveTextContent('Invalid details');
    });
    alertSpy.mockRestore();
  });
});
