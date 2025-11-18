
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import WalletAndWithdrawl from '../../../src/userDashboard/layouts/Wallet&Withdrawl';
import walletService from '../../../src/services/walletService';

// Mock walletService
vi.mock('../../../src/services/walletService', () => ({
  default: {
    getWalletByUserId: vi.fn(),
  },
}));

const mockStore = configureStore([]);

describe('WalletAndWithdrawl Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { _id: '123' },
      },
    });

    walletService.getWalletByUserId.mockResolvedValue({
      success: true,
      data: { balance: 1000, totalEarned: 2000, totalWithdrawn: 1000 },
    });
  });

  it('should render the component and display wallet balance', async () => {
    render(
      <Provider store={store}>
        <WalletAndWithdrawl darkMode={false} />
      </Provider>
    );

    expect(screen.getByText('Current Available Balance')).toBeInTheDocument();
    // Use findByText for async elements
    expect(await screen.findByText('₹1000.00')).toBeInTheDocument();
    expect(screen.getByText(/Total Earned: ₹2000.00/)).toBeInTheDocument();
    expect(screen.getByText(/Total Withdrawn: ₹1000.00/)).toBeInTheDocument();
  });

  it('should submit a withdrawal request', async () => {
    window.alert = vi.fn();
    render(
      <Provider store={store}>
        <WalletAndWithdrawl darkMode={false} />
      </Provider>
    );

    const amountInput = screen.getByPlaceholderText('e.g., 500.00');
    const requestButton = screen.getByText('REQUEST WITHDRAWAL');

    fireEvent.change(amountInput, { target: { value: '200' } });
    fireEvent.click(requestButton);

    expect(window.alert).toHaveBeenCalledWith('Withdrawal request submitted! Receipt downloaded.');
    expect(await screen.findByText('WDR-006')).toBeInTheDocument();
    expect(await screen.findByText('₹200.00')).toBeInTheDocument();
  });

  it('should show an alert for invalid withdrawal amount', () => {
    window.alert = vi.fn();
    render(
      <Provider store={store}>
        <WalletAndWithdrawl darkMode={false} />
      </Provider>
    );

    const requestButton = screen.getByText('REQUEST WITHDRAWAL');
    fireEvent.click(requestButton);

    expect(window.alert).toHaveBeenCalledWith('Enter a valid amount!');
  });

  it('should render in dark mode', () => {
    render(
      <Provider store={store}>
        <WalletAndWithdrawl darkMode={true} />
      </Provider>
    );

    const mainDiv = screen.getByText('Current Available Balance').closest('div.min-h-screen');
    expect(mainDiv).toHaveClass('bg-gray-900', 'text-white');
  });
});
