
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OffersTable from '../../../src/adminDashboard/components/ProductsTable';

describe('OffersTable Component', () => {
  it('should render the table with a header and data rows', () => {
    render(<OffersTable />);
    expect(screen.getByText('ALL Offers 18')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render the correct number of offer rows', () => {
    render(<OffersTable />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 5 data rows
    expect(rows).toHaveLength(6);
  });

  it('should display data for the first offer', () => {
    render(<OffersTable />);
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('08/06/2025')).toBeInTheDocument();
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
  });

  it('should trigger an alert when export is clicked', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<OffersTable />);
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    expect(alertSpy).toHaveBeenCalledWith('Exporting campaigns data...');
    alertSpy.mockRestore();
  });
});
