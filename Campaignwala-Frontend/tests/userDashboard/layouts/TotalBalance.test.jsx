
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TotalBalance from '../../../src/userDashboard/layouts/TotalBalance';

describe('TotalBalance Component', () => {
  it('should render the component with initial data', () => {
    render(<TotalBalance darkMode={false} />);

    expect(screen.getByText('Total Balance Overview')).toBeInTheDocument();
    expect(screen.getByText('$5,550.75')).toBeInTheDocument();
    expect(screen.getByText('Important Note')).toBeInTheDocument();
    expect(screen.getByText('Payment History')).toBeInTheDocument();

    // Check for a few payment history items
    expect(screen.getByText('WDR-001')).toBeInTheDocument();
    expect(screen.getByText('WDR-002')).toBeInTheDocument();
    expect(screen.getByText('WDR-003')).toBeInTheDocument();
  });

  it('should render in dark mode', () => {
    render(<TotalBalance darkMode={true} />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('bg-gray-950', 'text-gray-100');
  });

  it('should display the correct status badges', () => {
    render(<TotalBalance darkMode={false} />);

    const approvedStatus = screen.getAllByText('Approved');
    approvedStatus.forEach(status => {
        expect(status).toHaveClass('bg-green-100');
    });

    const pendingStatus = screen.getByText('Pending');
    expect(pendingStatus).toHaveClass('bg-yellow-100');

    const rejectedStatus = screen.getByText('Rejected');
    expect(rejectedStatus).toHaveClass('bg-red-100');
  });
});
