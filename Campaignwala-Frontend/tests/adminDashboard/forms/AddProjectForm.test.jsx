
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddOffersForm from '../../../src/adminDashboard/forms/AddProjectForm';
import { createOffer } from '../../../src/services/offerService';
import { getAllCategories } from '../../../src/services/categoryService';

// Mock services
vi.mock('../../../src/services/offerService');
vi.mock('../../../src/services/categoryService');

describe('AddOffersForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCategories = [
    { _id: '1', name: 'Category A' },
    { _id: '2', name: 'Category B' },
  ];

  it('should render the form with the title', async () => {
    getAllCategories.mockResolvedValue({ success: true, data: { categories: [] } });
    render(<AddOffersForm />);
    expect(screen.getByText('Add New Offers')).toBeInTheDocument();
  });

  it('should fetch and display categories', async () => {
    getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    render(<AddOffersForm />);
    await waitFor(() => {
      expect(screen.getByText('Category A')).toBeInTheDocument();
      expect(screen.getByText('Category B')).toBeInTheDocument();
    });
  });

  it('should show an error if fetching categories fails', async () => {
    getAllCategories.mockRejectedValue(new Error('Failed to load'));
    render(<AddOffersForm />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
    });
  });

  it('should show an error if Commission 1 is not provided on submit', async () => {
    getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    render(<AddOffersForm />);
    fireEvent.click(screen.getByRole('button', { name: /add offer/i }));
    await waitFor(() => {
      expect(screen.getByText('⚠️ Commission 1 is required!')).toBeInTheDocument();
    });
  });

  it('should call createOffer on submit with valid data', async () => {
    createOffer.mockResolvedValue({ success: true });
    getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    render(<AddOffersForm />);

    fireEvent.change(screen.getByLabelText(/offer name/i), { target: { value: 'Test Offer' } });
    fireEvent.change(screen.getByLabelText(/commission 1/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /add offer/i }));

    await waitFor(() => {
      expect(createOffer).toHaveBeenCalled();
      expect(screen.getByText('✅ Offer created successfully!')).toBeInTheDocument();
    });
  });

  it('should display an error message on failed submission', async () => {
    createOffer.mockRejectedValue(new Error('Failed to create'));
    getAllCategories.mockResolvedValue({ success: true, data: { categories: mockCategories } });
    render(<AddOffersForm />);

    fireEvent.change(screen.getByLabelText(/offer name/i), { target: { value: 'Test Offer' } });
    fireEvent.change(screen.getByLabelText(/commission 1/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /add offer/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create offer/i)).toBeInTheDocument();
    });
  });
});
