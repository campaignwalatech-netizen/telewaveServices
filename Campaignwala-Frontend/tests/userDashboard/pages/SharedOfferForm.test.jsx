
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SharedOfferForm from '../../../src/userDashboard/pages/SharedOfferForm';
import offerService from '../../../src/services/offerService';
import leadService from '../../../src/services/leadService';

// Mock services
vi.mock('../../../src/services/offerService', () => ({
  default: {
    getOfferById: vi.fn(),
  },
}));
vi.mock('../../../src/services/leadService', () => ({
  default: {
    createLead: vi.fn(),
  },
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockedNavigate,
      useParams: () => ({ offerId: 'offer123', hrUserId: 'hr123' }),
    };
  });

describe('SharedOfferForm Component', () => {
  const offerData = { _id: 'offer123', name: 'Test Offer', category: 'Test Category' };

  beforeEach(() => {
    offerService.getOfferById.mockResolvedValue({ success: true, data: offerData });
    leadService.createLead.mockResolvedValue({ success: true });
    window.alert = vi.fn();
  });

  it('should render loading state and then the form', async () => {
    render(
      <MemoryRouter>
        <SharedOfferForm darkMode={false} />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading offer details...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });
  });

  it('should show an error if offer is not found', async () => {
    offerService.getOfferById.mockResolvedValue({ success: false, message: 'Offer not found' });
    render(
      <MemoryRouter>
        <SharedOfferForm darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Offer not found')).toBeInTheDocument();
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <MemoryRouter>
        <SharedOfferForm darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('CLAIM NOW'));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
  });

  it('should submit the form successfully', async () => {
    render(
      <MemoryRouter>
        <SharedOfferForm darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your 10-digit phone number'), { target: { value: '9876543210' } });

    fireEvent.click(screen.getByText('CLAIM NOW'));

    await waitFor(() => {
      expect(leadService.createLead).toHaveBeenCalledWith({
        offerId: 'offer123',
        hrUserId: 'hr123',
        customerName: 'Test User',
        customerContact: '9876543210',
      });
      expect(window.alert).toHaveBeenCalledWith('Thank you! Your interest has been submitted successfully. We will contact you soon.');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
});
