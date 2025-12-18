
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ZeroFeeDemat from '../../../src/userDashboard/layouts/ZeroFeeDemat';
import offerService from '../../../src/services/offerService';

// Mock offerService
vi.mock('../../../src/services/offerService', () => ({
  default: {
    getOfferById: vi.fn(),
    getAllOffers: vi.fn(),
  },
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const mockStore = configureStore([]);

describe('ZeroFeeDemat Component', () => {
  let store;
  const offerData = {
    _id: 'offer123',
    name: 'Test Demat Offer',
    commission1: '₹100',
    commission2: '₹50',
    termsAndConditions: 'Test Terms',
  };

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { _id: 'user123' },
      },
    });
    offerService.getOfferById.mockResolvedValue({ success: true, data: offerData });
    offerService.getAllOffers.mockResolvedValue({ success: true, data: { offers: [offerData] } });
    navigator.clipboard.writeText.mockResolvedValue(undefined);
    window.alert = vi.fn();
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user/zerofee-demat/offer123']}>
            <Routes>
                <Route path="/user/zerofee-demat/:offerId" element={<ZeroFeeDemat darkMode={false} />} />
            </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Loading offer details...')).toBeInTheDocument();
  });

  it('should fetch and display offer details', async () => {
    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/user/zerofee-demat/offer123']}>
              <Routes>
                  <Route path="/user/zerofee-demat/:offerId" element={<ZeroFeeDemat darkMode={false} />} />
              </Routes>
          </MemoryRouter>
        </Provider>
      );

    await waitFor(() => {
        expect(screen.getByText('Test Demat Offer')).toBeInTheDocument();
    });

    expect(screen.getByText('₹100')).toBeInTheDocument();
    expect(screen.getByText('Test Terms')).toBeInTheDocument();
  });

  it('should copy the share link to clipboard', async () => {
    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/user/zerofee-demat/offer123']}>
              <Routes>
                  <Route path="/user/zerofee-demat/:offerId" element={<ZeroFeeDemat darkMode={false} />} />
              </Routes>
          </MemoryRouter>
        </Provider>
      );

    await waitFor(() => {
        expect(screen.getByText('Test Demat Offer')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy Link');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:8080/share/offer123/user123');
    expect(window.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });

  it('should fetch first demat offer if no offerId is present', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user/zerofee-demat']}>
            <Routes>
                <Route path="/user/zerofee-demat" element={<ZeroFeeDemat darkMode={false} />} />
            </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
        expect(offerService.getAllOffers).toHaveBeenCalled();
    });
  });
});
