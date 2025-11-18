
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OverviewCards from '../../../src/userDashboard/components/OverviewCards';

describe('OverviewCards Component', () => {

  it('should render all three hardcoded overview cards', () => {
    render(<OverviewCards />);
    
    // Check for titles
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('Total Bonus')).toBeInTheDocument();
  });

  it('should display the correct values for each card', () => {
    render(<OverviewCards />);

    expect(screen.getByText('₹ 5,200.75')).toBeInTheDocument();
    expect(screen.getByText('₹ 18,500.00')).toBeInTheDocument();
    expect(screen.getByText('₹ 1,500.00')).toBeInTheDocument();
  });

  it('should display the correct notes for each card', () => {
    render(<OverviewCards />);

    expect(screen.getByText('+₹250.00 from last week')).toBeInTheDocument();
    expect(screen.getByText('+₹1,200.00 this month')).toBeInTheDocument();
    expect(screen.getByText('Referral bonuses received')).toBeInTheDocument();
  });

});
