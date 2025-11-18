
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ToastMessage from '../../../src/userDashboard/components/ToastMessage';

describe('ToastMessage', () => {
  it('renders the success message correctly', () => {
    render(<ToastMessage />);
    
    // Check that the text is present
    const messageElement = screen.getByText('✅ Success toast message');
    expect(messageElement).toBeInTheDocument();
  });

  it('applies the correct styling classes for a success toast', () => {
    const { container } = render(<ToastMessage />);
    
    // The first child of the container is the main div of the component
    const toastDiv = container.firstChild;

    // Check for background and text color classes
    expect(toastDiv).toHaveClass('bg-green-100');
    expect(toastDiv).toHaveClass('text-green-800');
    
    // Check for other layout classes
    expect(toastDiv).toHaveClass('p-2', 'px-4', 'rounded-md');
  });
});
