
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminLogsTable from '../../../src/adminDashboard/forms/AdminLogsTable';

describe('AdminLogsTable Component', () => {
  it('should render the table with a title and logs', () => {
    render(<AdminLogsTable />);
    expect(screen.getByText('Admin Activity Logs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export logs/i })).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // Header + data rows
  });

  it('should apply the correct color style for severity', () => {
    render(<AdminLogsTable />);
    const infoBadge = screen.getByText('info').closest('span');
    expect(infoBadge).toHaveClass('bg-blue-100');

    const successBadge = screen.getByText('success').closest('span');
    expect(successBadge).toHaveClass('bg-green-100');

    const warningBadge = screen.getByText('warning').closest('span');
    expect(warningBadge).toHaveClass('bg-yellow-100');

    const errorBadge = screen.getByText('error').closest('span');
    expect(errorBadge).toHaveClass('bg-red-100');
  });

  it('should open the details modal on "View Details" click', () => {
    render(<AdminLogsTable />);
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButtons[0]);

    expect(screen.getByText('Admin Log Details')).toBeInTheDocument();
    expect(screen.getByText(/modified offers title and description/i)).toBeInTheDocument();
  });

  it('should close the modal when the close button is clicked', () => {
    render(<AdminLogsTable />);
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButtons[0]);

    // Modal is open
    expect(screen.getByText('Admin Log Details')).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]); // Click the header close button

    expect(screen.queryByText('Admin Log Details')).not.toBeInTheDocument();
  });
});
