
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Wallet from '../../../src/userDashboard/pages/wallet';

describe('Wallet Component', () => {
  it('should render the component with wallet data', () => {
    render(<Wallet darkMode={false} />);

    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('₹12,450')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('+₹2,340')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('₹890')).toBeInTheDocument();
  });

  it('should render in dark mode', () => {
    render(<Wallet darkMode={true} />);

    const mainDiv = screen.getByText('Wallet').closest('.min-h-screen');
    expect(mainDiv).toHaveClass('bg-gray-900', 'text-white');
  });
});
