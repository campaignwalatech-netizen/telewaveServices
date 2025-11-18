
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OffersGrid from '../../../src/userDashboard/components/OffersGrid';

// Mock assets
vi.mock('../assets/credit-card.png', () => ({ default: 'credit-card.png' }));
vi.mock('../assets/loan.png', () => ({ default: 'loan.png' }));
vi.mock('../assets/demat.png', () => ({ default: 'demat.png' }));
vi.mock('../assets/savings.png', () => ({ default: 'savings.png' }));

describe('OffersGrid Component', () => {

  it('should render the heading', () => {
    render(<OffersGrid />);
    expect(screen.getByRole('heading', { name: /available offers/i })).toBeInTheDocument();
  });

  it('should render all four hardcoded offer cards', () => {
    render(<OffersGrid />);
    const offerHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(offerHeadings).toHaveLength(4);

    expect(screen.getByText('IndusInd Bank Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Bajaj EMI Card')).toBeInTheDocument();
    expect(screen.getByText('Demat Account')).toBeInTheDocument();
    expect(screen.getByText('Savings Account')).toBeInTheDocument();
  });

  it('should display the correct reward text for each offer', () => {
    render(<OffersGrid />);
    expect(screen.getByText('Earn ₹1500 per successful activation')).toBeInTheDocument();
    expect(screen.getByText('Earn ₹800 per successful activation')).toBeInTheDocument();
    expect(screen.getByText('Earn ₹750 per successful opening')).toBeInTheDocument();
  });

  it('should render images with correct alt text', () => {
    render(<OffersGrid />);
    expect(screen.getByAltText('IndusInd Bank Credit Card')).toBeInTheDocument();
    expect(screen.getByAltText('Bajaj EMI Card')).toBeInTheDocument();
    expect(screen.getByAltText('Demat Account')).toBeInTheDocument();
    expect(screen.getByAltText('Savings Account')).toBeInTheDocument();
  });

});
