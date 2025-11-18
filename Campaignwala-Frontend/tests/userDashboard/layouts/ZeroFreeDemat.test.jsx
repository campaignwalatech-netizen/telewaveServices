
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ZeroFeeDemat from '../../../src/userDashboard/layouts/ZeroFreeDemat';
import offerService from '../../../src/services/offerService';

// Mock services and hooks
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock('../../../src/services/offerService');

// Mock clipboard and alert
Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
window.alert = vi.fn();

const mockUser = { _id: 'user123', name: 'Test User' };
const mockOffer = {
  _id: 'offer456',
  name: 'Super Demat Account',
  category: 'DEMAT',
  commission1: '₹700 per trade',
  commission1Comment: 'Instant credit',
  commission2: 'Bonus ₹200',
  commission2Comment: 'After 5 trades',
  termsAndConditions: '1. Must be 18+\n2. PAN card required',
};

describe('ZeroFeeDemat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockReturnValue(mockUser);
  });

  const renderComponent = (offerId = null) => {
    const route = offerId ? `/offer/${offerId}` : '/offer';
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/offer/:offerId?" element={<ZeroFeeDemat darkMode={false} />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loading state initially', () => {
    offerService.getOfferById.mockReturnValue(new Promise(() => {})); // Keep it pending
    renderComponent('offer456');
    expect(screen.getByText('Loading offer details...')).toBeInTheDocument();
  });

  it('fetches and displays a specific offer by ID', async () => {
    offerService.getOfferById.mockResolvedValue({ success: true, data: mockOffer });
    renderComponent('offer456');

    await waitFor(() => {
      expect(screen.getByText('Super Demat Account')).toBeInTheDocument();
    });

    expect(screen.getByText('₹700 per trade')).toBeInTheDocument();
    expect(screen.getByText('1. Must be 18+')).toBeInTheDocument();
    expect(screen.getByText('2. PAN card required')).toBeInTheDocument();
    expect(offerService.getOfferById).toHaveBeenCalledWith('offer456');
  });

  it('fetches the first DEMAT offer if no ID is provided', async () => {
    const otherOffer = { _id: 'offer789', name: 'Credit Card', category: 'FINANCE' };
    offerService.getAllOffers.mockResolvedValue({ success: true, data: { offers: [otherOffer, mockOffer] } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Super Demat Account')).toBeInTheDocument();
    });

    expect(offerService.getAllOffers).toHaveBeenCalled();
  });

  it('displays default content if offer fetch fails', async () => {
    offerService.getOfferById.mockRejectedValue(new Error('API Error'));
    renderComponent('offer456');

    await waitFor(() => {
      expect(screen.getByText('Zero-Fee Demat Account')).toBeInTheDocument();
    });

    expect(screen.getByText('₹500 per approved application')).toBeInTheDocument();
  });

  it('displays default content if no DEMAT offer is found', async () => {
    const otherOffer = { _id: 'offer789', name: 'Credit Card', category: 'FINANCE' };
    offerService.getAllOffers.mockResolvedValue({ success: true, data: { offers: [otherOffer] } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Zero-Fee Demat Account')).toBeInTheDocument();
    });
  });

  it('copies the share link to clipboard for a logged-in user', async () => {
    offerService.getOfferById.mockResolvedValue({ success: true, data: mockOffer });
    renderComponent('offer456');

    await waitFor(() => {
      expect(screen.getByText('Super Demat Account')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: 'Copy Link' });
    fireEvent.click(copyButton);

    const expectedLink = `${window.location.origin}/share/offer456/user123`;
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedLink);
    expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });

  it('shows an alert if a logged-out user tries to copy the link', async () => {
    useSelector.mockReturnValue(null); // Simulate logged-out user
    offerService.getOfferById.mockResolvedValue({ success: true, data: mockOffer });
    renderComponent('offer456');

    await waitFor(() => {
      expect(screen.getByText('Super Demat Account')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: 'Copy Link' });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please login to generate your share link.');
  });

  it('applies dark mode styles correctly', async () => {
    offerService.getOfferById.mockResolvedValue({ success: true, data: mockOffer });
    const { container } = render(
      <MemoryRouter initialEntries={['/offer/offer456']}>
        <Routes>
          <Route path="/offer/:offerId?" element={<ZeroFeeDemat darkMode={true} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('bg-gray-900', 'text-white');
    });
  });
});
