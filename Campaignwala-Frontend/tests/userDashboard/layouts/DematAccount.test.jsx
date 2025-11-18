
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DematAccount from '../../../src/userDashboard/layouts/DematAccount';
import offerService from '../../../src/services/offerService';

// Mock dependencies
vi.mock('../../../src/services/offerService');
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: vi.fn(),
        useLocation: vi.fn(),
    };
});

const useParams = vi.mocked(require('react-router-dom').useParams);
const useLocation = vi.mocked(require('react-router-dom').useLocation);

const mockOffers = [
  { _id: 'offer1', name: 'Offer 1', description: 'Desc 1', commission1: '₹100' },
  { _id: 'offer2', name: 'Offer 2', description: 'Desc 2', commission1: '₹200' },
];

describe('DematAccount (Offers Page) Layout', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockReturnValue({ id: 'user123' }); // Mock user
    useParams.mockReturnValue({ categoryId: 'cat1' });
    useLocation.mockReturnValue({ state: { categoryName: 'Test Category' } });
  });

  const renderComponent = (darkMode = false) => {
    return render(
      <MemoryRouter>
        <DematAccount darkMode={darkMode} />
      </MemoryRouter>
    );
  };

  it('should show a loading state initially', () => {
    offerService.getOffersByCategory.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText(/loading offers.../i)).toBeInTheDocument();
  });

  it('should display offers when API call is successful', async () => {
    offerService.getOffersByCategory.mockResolvedValue({ success: true, data: mockOffers });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Offer 1')).toBeInTheDocument();
      expect(screen.getByText('Offer 2')).toBeInTheDocument();
    });
  });

  it('should display a message when no offers are found', async () => {
    offerService.getOffersByCategory.mockResolvedValue({ success: true, data: [] });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no offers available/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard when "Back to Dashboard" is clicked', async () => {
    offerService.getOffersByCategory.mockResolvedValue({ success: true, data: [] });
    renderComponent();

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
  });

  it('should navigate to the share page when "Share" is clicked', async () => {
    offerService.getOffersByCategory.mockResolvedValue({ success: true, data: mockOffers });
    renderComponent();

    await waitFor(() => {
      // Get all share buttons and click the first one
      const shareButtons = screen.getAllByRole('button', { name: /share/i });
      fireEvent.click(shareButtons[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/user/zerofee-demat/offer1');
  });

  it('should use fallback fetching when categoryId is \'fallback\'', async () => {
    useParams.mockReturnValue({ categoryId: 'fallback' });
    useLocation.mockReturnValue({ state: { categoryName: 'Demat' } });
    const allOffers = {
        success: true,
        data: {
            offers: [
                { _id: 'offer3', name: 'Demat Offer', category: { name: 'Demat' } },
                { _id: 'offer4', name: 'Credit Card', category: { name: 'Card' } },
            ]
        }
    };
    offerService.getAllOffers.mockResolvedValue(allOffers);

    renderComponent();

    await waitFor(() => {
        expect(screen.getByText('Demat Offer')).toBeInTheDocument();
        expect(screen.queryByText('Credit Card')).not.toBeInTheDocument();
    });
    expect(offerService.getAllOffers).toHaveBeenCalled();
    expect(offerService.getOffersByCategory).not.toHaveBeenCalled();
  });
});
