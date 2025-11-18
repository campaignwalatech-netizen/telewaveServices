
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OffersTable from '../../src/components/ProductsTable';

describe('OffersTable Component', () => {
  it('should render the table with headers and data', () => {
    render(<OffersTable />);
    expect(screen.getByText('ALL CAMPAIGNS')).toBeInTheDocument();
    expect(screen.getByText('18 active campaigns')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display the correct number of rows', () => {
    render(<OffersTable />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 5 data rows
    expect(rows).toHaveLength(6);
  });

  it('should display the correct data in the first row', () => {
    render(<OffersTable />);
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('08/06/2025')).toBeInTheDocument();
    expect(screen.getByText('UPLOAD')).toBeInTheDocument();
    //There are multiple '₹50' in the table, so we can't use getByText
    //expect(screen.getByText('₹50')).toBeInTheDocument();
  });
});
