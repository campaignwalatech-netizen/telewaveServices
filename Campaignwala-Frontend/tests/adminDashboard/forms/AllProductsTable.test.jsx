import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AllOffersTable from '../../../src/adminDashboard/forms/AllProductsTable';
import * as offerService from '../../../src/services/offerService';
import * as categoryService from '../../../src/services/categoryService';

// Mock the services
vi.mock('../../../src/services/offerService');
vi.mock('../../../src/services/categoryService');

const mockOffers = [
  {
    _id: '1',
    name: 'Offer One',
    category: 'Finance',
    latestStage: 'Pending',
    commission1: '10%',
    commission2: '5%',
    isApproved: false,
    createdAt: new Date().toISOString(),
    link: 'https://example.com/offer1',
  },
  {
    _id: '2',
    name: 'Offer Two',
    category: 'Tech',
    latestStage: 'Completed',
    commission1: '20%',
    commission2: '10%',
    isApproved: true,
    createdAt: new Date().toISOString(),
    link: 'https://example.com/offer2',
  },
];

const mockCategories = [
    { _id: 'cat1', name: 'Finance' },
    { _id: 'cat2', name: 'Tech' },
];

describe('AllOffersTable Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Default successful mocks
    offerService.getAllOffers.mockResolvedValue({ success: true, data: { offers: mockOffers } });
    categoryService.getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    offerService.deleteOffer.mockResolvedValue({ success: true });
    offerService.updateOffer.mockResolvedValue({ success: true, data: { ...mockOffers[0], name: 'Updated Offer' } });
  });

  it('should show loading state initially and then render offers', async () => {
    render(<AllOffersTable />);
    
    expect(screen.getByText(/Loading offers.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Offer One')).toBeInTheDocument();
      expect(screen.getByText('Offer Two')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetching offers fails', async () => {
    offerService.getAllOffers.mockRejectedValue({ response: { data: { message: 'Network Error' } } });
    render(<AllOffersTable />);

    await waitFor(() => {
      expect(screen.getByText(/Error Loading Offers/i)).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('should display "No offers found" message when there are no offers', async () => {
    offerService.getAllOffers.mockResolvedValue({ success: true, data: { offers: [] } });
    render(<AllOffersTable />);

    await waitFor(() => {
      expect(screen.getByText(/No offers found/i)).toBeInTheDocument();
    });
  });

  it('should filter offers based on search term', async () => {
    render(<AllOffersTable />);
    await waitFor(() => expect(screen.getByText('Offer One')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search offers.../i);
    fireEvent.change(searchInput, { target: { value: 'Offer One' } });

    await waitFor(() => {
        expect(offerService.getAllOffers).toHaveBeenCalledWith(expect.objectContaining({ search: 'Offer One' }));
    });
  });

  it('should open and handle delete confirmation modal', async () => {
    render(<AllOffersTable />);
    await waitFor(() => expect(screen.getByText('Offer One')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(offerService.deleteOffer).toHaveBeenCalledWith('1');
      expect(screen.getByText(/"Offer One" deleted successfully!/i)).toBeInTheDocument();
    });
  });

  it('should open and handle edit modal', async () => {
    render(<AllOffersTable />);
    await waitFor(() => expect(screen.getByText('Offer One')).toBeInTheDocument());

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByText(/Edit Offer/i)).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Offer Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Offer' } });

    const updateButton = screen.getByRole('button', { name: /Update Offer/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(offerService.updateOffer).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Updated Offer' }));
      expect(screen.getByText(/"Updated Offer" updated successfully!/i)).toBeInTheDocument();
    });
  });
});