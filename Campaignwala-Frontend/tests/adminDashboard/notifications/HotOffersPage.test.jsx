
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HotOffersPage from '../../../src/adminDashboard/notifications/HotOffersPage';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('HotOffersPage Component', () => {
  it('should render the page with initial elements', () => {
    render(<HotOffersPage />);
    expect(screen.getByText('Hot Offers Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Offer Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Discount')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Offer Preview')).toBeInTheDocument();
    expect(screen.getByText(/Send to/)).toBeDisabled();
  });

  it('should update form fields on user input', () => {
    render(<HotOffersPage />);
    const titleInput = screen.getByLabelText('Offer Title');
    const discountInput = screen.getByLabelText('Discount');
    const descriptionInput = screen.getByLabelText('Description');

    fireEvent.change(titleInput, { target: { value: 'Test Offer' } });
    fireEvent.change(discountInput, { target: { value: '25' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    expect(titleInput.value).toBe('Test Offer');
    expect(discountInput.value).toBe('25');
    expect(descriptionInput.value).toBe('Test description');
  });

  it('should enable the send button when form is valid and segments are selected', () => {
    render(<HotOffersPage />);
    const titleInput = screen.getByLabelText('Offer Title');
    const discountInput = screen.getByLabelText('Discount');
    const descriptionInput = screen.getByLabelText('Description');
    const activeUsersSegment = screen.getByText('Active Users');

    fireEvent.change(titleInput, { target: { value: 'Test Offer' } });
    fireEvent.change(discountInput, { target: { value: '25' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.click(activeUsersSegment);

    expect(screen.getByText(/Send to/)).toBeEnabled();
  });

  it('should show success message after sending', async () => {
    render(<HotOffersPage />);
    const titleInput = screen.getByLabelText('Offer Title');
    const discountInput = screen.getByLabelText('Discount');
    const descriptionInput = screen.getByLabelText('Description');
    const activeUsersSegment = screen.getByText('Active Users');
    const sendButton = screen.getByText(/Send to/);

    fireEvent.change(titleInput, { target: { value: 'Test Offer' } });
    fireEvent.change(discountInput, { target: { value: '25' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    fireEvent.click(activeUsersSegment);
    fireEvent.click(sendButton);

    expect(await screen.findByText('Bulk Hot Offer Sent Successfully! 🎉')).toBeInTheDocument();
  });

  it('should navigate back when back button is clicked', () => {
    render(<HotOffersPage />);
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/admin/notifications');
  });
});
