
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationPage from '../../../src/userDashboard/layouts/NotificationPage';

describe('NotificationPage Layout', () => {

  const renderComponent = (darkMode = false) => {
    return render(<NotificationPage darkMode={darkMode} />);
  };

  it('should render the title and initial notifications', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/kyc verification pending/i)).toBeInTheDocument();
    expect(screen.getByText(/withdrawal request approved/i)).toBeInTheDocument();
  });

  it('should show unread indicators for unread notifications', () => {
    const { container } = renderComponent();
    // The unread notification has a blue dot. We can check for its presence.
    // This is a bit fragile, a data-testid would be better.
    const unreadNotification = screen.getByText(/kyc verification pending/i).closest('div.flex');
    const readNotification = screen.getByText(/withdrawal request approved/i).closest('div.flex');

    const unreadIndicator = unreadNotification.querySelector('.bg-blue-600');
    const readIndicator = readNotification.querySelector('.bg-blue-600');

    expect(unreadIndicator).toBeInTheDocument();
    expect(readIndicator).not.toBeInTheDocument();
  });

  it('should mark all notifications as read when the button is clicked', () => {
    const { container } = renderComponent();
    
    // Initially, one unread indicator exists
    expect(container.querySelector('.bg-blue-600')).toBeInTheDocument();

    const markAllReadButton = screen.getByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllReadButton);

    // After clicking, no unread indicators should exist
    expect(container.querySelector('.bg-blue-600')).not.toBeInTheDocument();
  });

  it('should render type-specific icons', () => {
    renderComponent();
    // Check for the text content of the icon span
    expect(screen.getByText('⚠️')).toBeInTheDocument(); // Warning
    expect(screen.getByText('✓')).toBeInTheDocument(); // Success
    expect(screen.getByText('ℹ️')).toBeInTheDocument(); // Info
  });

  it('should render with dark mode classes', () => {
    const { container } = renderComponent(true);
    expect(container.firstChild).toHaveClass('bg-gray-950');
    const notificationItem = screen.getByText(/kyc verification pending/i).closest('div.border-b');
    expect(notificationItem).toHaveClass('bg-gray-800'); // Unread dark mode background
  });

});
