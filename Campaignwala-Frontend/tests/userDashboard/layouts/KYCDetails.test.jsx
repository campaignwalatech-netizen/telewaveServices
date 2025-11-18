
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KYCDetails from '../../../src/userDashboard/layouts/KYCDetails';

describe('KYCDetails Layout', () => {

  const renderComponent = (darkMode = false) => {
    return render(<KYCDetails darkMode={darkMode} />);
  };

  it('should render all sections with fields initially as read-only', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /kyc\/personal details/i })).toBeInTheDocument();
    
    // Check a field from each section
    expect(screen.getByDisplayValue('John')).toBeDisabled();
    expect(screen.getByDisplayValue(/ERAPA76845ER/i)).toBeDisabled();
    expect(screen.getByDisplayValue('Axis Bank')).toBeDisabled();
  });

  it('should make the Personal Details section editable when Edit is clicked', () => {
    renderComponent();
    const personalDetailsEditButton = screen.getAllByRole('button', { name: /edit/i })[0];

    fireEvent.click(personalDetailsEditButton);

    // Check that a field is now enabled
    expect(screen.getByDisplayValue('John')).not.toBeDisabled();
    // Check that the button text changed to Save
    expect(screen.getAllByRole('button', { name: /save/i })[0]).toBeInTheDocument();
    // Check that other sections are still disabled
    expect(screen.getByDisplayValue(/ERAPA76845ER/i)).toBeDisabled();
  });

  it('should allow input when a section is in edit mode', () => {
    renderComponent();
    const personalDetailsEditButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(personalDetailsEditButton);

    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    expect(firstNameInput.value).toBe('Jane');
  });

  it('should return a section to read-only when Save is clicked', () => {
    renderComponent();
    const personalDetailsEditButton = screen.getAllByRole('button', { name: /edit/i })[0];
    fireEvent.click(personalDetailsEditButton);

    // Section is now editable
    const firstNameInput = screen.getByDisplayValue('John');
    expect(firstNameInput).not.toBeDisabled();

    const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
    fireEvent.click(saveButton);

    // Section should be read-only again
    expect(firstNameInput).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /edit/i })[0]).toBeInTheDocument();
  });

  it('should toggle editing for KYC and Bank sections independently', () => {
    renderComponent();
    const kycEditButton = screen.getAllByRole('button', { name: /edit/i })[1];
    const bankEditButton = screen.getAllByRole('button', { name: /edit/i })[2];

    // Edit KYC
    fireEvent.click(kycEditButton);
    expect(screen.getByDisplayValue(/ERAPA76845ER/i)).not.toBeDisabled();
    expect(screen.getByDisplayValue('Axis Bank')).toBeDisabled();

    // Edit Bank
    fireEvent.click(bankEditButton);
    expect(screen.getByDisplayValue('Axis Bank')).not.toBeDisabled();

    // Save KYC
    const kycSaveButton = screen.getAllByRole('button', { name: /save/i })[0];
    fireEvent.click(kycSaveButton);
    expect(screen.getByDisplayValue(/ERAPA76845ER/i)).toBeDisabled();
    expect(screen.getByDisplayValue('Axis Bank')).not.toBeDisabled(); // Bank should still be editable
  });

  it('should render with dark mode classes', () => {
    const { container } = renderComponent(true);
    expect(container.firstChild).toHaveClass('bg-gray-950');
  });
});
