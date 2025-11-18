import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../../src/userDashboard/components/Dashboard';
import api from '../../../src/services/api';

// Mock api service
vi.mock('../../../src/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockedNavigate,
    };
  });

describe('Dashboard Component', () => {
  const categoriesData = {
    success: true,
    data: {
      categories: [
        { _id: '1', name: 'Category 1', description: 'Desc 1' },
        { _id: '2', name: 'Category 2', description: 'Desc 2' },
      ],
    },
  };

  beforeEach(() => {
    api.get.mockResolvedValue({ data: categoriesData });
  });

  it('should render loading state and then the dashboard with categories', async () => {
    render(
      <MemoryRouter>
        <Dashboard darkMode={false} />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('should navigate on stats card click', async () => {
    render(
      <MemoryRouter>
        <Dashboard darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Current Balance'));
    expect(mockedNavigate).toHaveBeenCalledWith('/user/wallet-withdrawl');

    fireEvent.click(screen.getByText('Total Earnings'));
    expect(mockedNavigate).toHaveBeenCalledWith('/user/total-balance');
  });

  it('should navigate on category card click', async () => {
    render(
      <MemoryRouter>
        <Dashboard darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByText('Category 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Category 1'));
    expect(mockedNavigate).toHaveBeenCalledWith('/user/category-offers/1', expect.any(Object));
  });

  it('should render fallback data if categories fail to load', async () => {
    api.get.mockResolvedValue({ data: { success: false } });
    render(
      <MemoryRouter>
        <Dashboard darkMode={false} />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Industrial Bank Credit Card')).toBeInTheDocument();
      expect(screen.getByText('Bajaj EMI Card')).toBeInTheDocument();
    });
  });
});