
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OffersPage from '../../../src/adminDashboard/pages/ProductsPage';

// Mock hooks and components
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../../src/context-api/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('../../../src/adminDashboard/components/AdminSidebar', () => ({
  default: ({ handleLogout }) => (
    <div>
      <span>AdminSidebar</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ),
}));

vi.mock('../../../src/adminDashboard/components/AdminHeader', () => ({
  default: () => <div>AdminHeader</div>,
}));

describe('ProductsPage (OffersPage) Component', () => {
  beforeEach(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('userPhone', '1234567890');
  });

  it('should render the page with all components', () => {
    render(<OffersPage />);
    expect(screen.getByText('AdminSidebar')).toBeInTheDocument();
    expect(screen.getByText('AdminHeader')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('should render product cards', () => {
    render(<OffersPage />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();
    expect(screen.getByText('Product D')).toBeInTheDocument();
  });

  it('should display correct status for each product', () => {
    render(<OffersPage />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('should have Edit and Delete buttons for each product', () => {
    render(<OffersPage />);
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons.length).toBe(4);
    expect(deleteButtons.length).toBe(4);
  });

  it('should call handleLogout and navigate on logout button click', () => {
    render(<OffersPage />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(localStorage.getItem('userPhone')).toBeNull();
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });
});
