
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KYCReview from '../../../src/adminDashboard/forms/KYCReview';

describe('KYCReview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the table of pending applications by default', () => {
    render(<KYCReview />);
    expect(screen.getByText('KYC Review - Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Patel')).toBeInTheDocument();
  });

  it('should filter the table based on search term', () => {
    render(<KYCReview />);
    const searchInput = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(searchInput, { target: { value: 'Priya' } });
    expect(screen.getByText('Priya Patel')).toBeInTheDocument();
    expect(screen.queryByText('Aarav Sharma')).not.toBeInTheDocument();
  });

  it('should switch to the details view on "View Details" click', () => {
    render(<KYCReview />);
    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewButtons[0]);
    expect(screen.getByText('KYC Review - Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument(); // PAN Number
  });

  it('should switch back to the table view from details view', () => {
    render(<KYCReview />);
    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewButtons[0]);

    // Now in details view
    const backButton = screen.getByRole('button', { name: /back to list/i });
    fireEvent.click(backButton);

    expect(screen.getByText('KYC Review - Pending Applications')).toBeInTheDocument();
  });

  it('should show an alert on approval', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<KYCReview />);
    fireEvent.click(screen.getAllByRole('button', { name: /view details/i })[0]);

    const approveButton = screen.getByRole('button', { name: /approve kyc/i });
    fireEvent.click(approveButton);

    expect(alertSpy).toHaveBeenCalledWith('KYC approved for Aarav Sharma');
    expect(screen.getByText('KYC Review - Pending Applications')).toBeInTheDocument();
    alertSpy.mockRestore();
  });

  it('should prompt for a reason and show an alert on rejection', () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Incorrect documents');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<KYCReview />);
    fireEvent.click(screen.getAllByRole('button', { name: /view details/i })[0]);

    const rejectButton = screen.getByRole('button', { name: /reject kyc/i });
    fireEvent.click(rejectButton);

    expect(promptSpy).toHaveBeenCalledWith('Please enter reason for rejection:');
    expect(alertSpy).toHaveBeenCalledWith('KYC rejected for Aarav Sharma');
    promptSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
