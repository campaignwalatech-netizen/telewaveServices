
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../../src/adminDashboard/components/Sidebar';

describe('Sidebar Component', () => {
  const renderComponent = (initialPath = '/admin') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it('should render the sidebar with logo and menu items', () => {
    renderComponent();
    expect(screen.getByText('Campaignwala')).toBeInTheDocument();
    expect(screen.getByText('Manage Account')).toBeInTheDocument();
    expect(screen.getByText('Payment Withdrawal List')).toBeInTheDocument();
  });

  it('should toggle submenu visibility on click', () => {
    renderComponent();
    const manageAccountMenu = screen.getByText('Manage Account');
    fireEvent.click(manageAccountMenu);
    expect(screen.getByText('All Offers')).toBeInTheDocument();

    fireEvent.click(manageAccountMenu);
    expect(screen.queryByText('All Offers')).not.toBeInTheDocument();
  });

  it('should navigate on non-submenu item click', () => {
    renderComponent();
    const paymentLink = screen.getByText('Payment Withdrawal List');
    expect(paymentLink.closest('a')).toHaveAttribute('href', '/admin/payment-withdrawal');
  });

  it('should automatically expand the parent menu of an active submenu item', () => {
    renderComponent('/admin/all-categories');
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('should open and close on mobile', () => {
    renderComponent();
    const toggleButton = screen.getByLabelText('Toggle menu');
    const sidebar = toggleButton.nextElementSibling;

    expect(sidebar).toHaveClass('-translate-x-full');

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('translate-x-0');

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('-translate-x-full');
  });
});
