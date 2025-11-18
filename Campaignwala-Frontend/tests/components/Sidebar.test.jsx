
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from '../../src/components/Sidebar';

describe('Sidebar Component', () => {
  it('should render the sidebar with a logo and menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Campaignwala')).toBeInTheDocument();
    expect(screen.getByText('Manage Leads')).toBeInTheDocument();
    expect(screen.getByText('All Offers')).toBeInTheDocument();
  });

  it('should highlight the active menu item', () => {
    render(<Sidebar />);
    const activeItem = screen.getByText('All Offers').closest('a');
    expect(activeItem).toHaveClass('bg-sidebar-accent');
  });

  it('should open and close on mobile', () => {
    render(<Sidebar />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    const sidebar = toggleButton.nextElementSibling;

    // Sidebar is initially closed on mobile (based on class)
    expect(sidebar).toHaveClass('-translate-x-full');

    // Open sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('translate-x-0');

    // Close sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should close when a menu item is clicked on mobile', () => {
    render(<Sidebar />);
    const toggleButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggleButton); // Open sidebar

    const manageLeadsLink = screen.getByText('Manage Leads');
    fireEvent.click(manageLeadsLink);

    const sidebar = toggleButton.nextElementSibling;
    expect(sidebar).toHaveClass('-translate-x-full');
  });
});
