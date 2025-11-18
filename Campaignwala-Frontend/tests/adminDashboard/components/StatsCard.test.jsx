
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DollarSign } from 'lucide-react';
import StatsCard from '../../../src/adminDashboard/components/StatsCard';

const mockStat = {
  title: 'Total Revenue',
  value: '$45,231.89',
  icon: DollarSign,
  color: 'bg-blue-500',
  change: '+20.1%',
};

describe('StatsCard Component', () => {
  it('should render the stats card with all data points', () => {
    render(<StatsCard stat={mockStat} />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,231.89')).toBeInTheDocument();
    expect(screen.getByText('+20.1%')).toBeInTheDocument();
  });

  it('should apply the correct background color to the icon container', () => {
    render(<StatsCard stat={mockStat} />);
    const iconContainer = screen.getByText('Total Revenue').previousElementSibling.querySelector('.p-3');
    expect(iconContainer).toHaveClass('bg-blue-500');
  });
});
