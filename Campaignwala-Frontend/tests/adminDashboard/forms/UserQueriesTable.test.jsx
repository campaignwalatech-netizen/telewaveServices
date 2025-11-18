
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserQueriesTable from '../../../../src/adminDashboard/forms/UserQueriesTable';
import { useTheme } from '../../../../src/context-api/ThemeContext';

// Mock the useTheme hook
vi.mock('../../../../src/context-api/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('UserQueriesTable Component', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: 'light' });
  });

  it('should render the title and a list of query cards', () => {
    render(<UserQueriesTable />);
    expect(screen.getByText('QUERIES')).toBeInTheDocument();
    expect(screen.getByText('Jahnavi Verma')).toBeInTheDocument();
    expect(screen.getByText('Sarah Smith')).toBeInTheDocument();
  });

  it('should open the reply modal on "Reply" click', () => {
    render(<UserQueriesTable />);
    const replyButtons = screen.getAllByRole('button', { name: /reply/i });
    fireEvent.click(replyButtons[0]);
    expect(screen.getByText('Reply to Query')).toBeInTheDocument();
    expect(screen.getByText('Original Query:')).toBeInTheDocument();
  });

  it('should have a disabled "Send Reply" button when the message is empty', () => {
    render(<UserQueriesTable />);
    fireEvent.click(screen.getAllByRole('button', { name: /reply/i })[0]);
    const sendButton = screen.getByRole('button', { name: /send reply/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable the "Send Reply" button when a message is typed', () => {
    render(<UserQueriesTable />);
    fireEvent.click(screen.getAllByRole('button', { name: /reply/i })[0]);
    const textarea = screen.getByPlaceholderText(/type your response/i);
    fireEvent.change(textarea, { target: { value: 'Test reply' } });
    const sendButton = screen.getByRole('button', { name: /send reply/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('should add a reply and update the UI on send', async () => {
    render(<UserQueriesTable />);
    const jahnaviQueryCard = screen.getByText('Jahnavi Verma').closest('div');
    const replyButton = jahnaviQueryCard.querySelector('button');

    // Before replying
    expect(replyButton).toHaveTextContent('Reply');

    fireEvent.click(replyButton);

    const textarea = screen.getByPlaceholderText(/type your response/i);
    fireEvent.change(textarea, { target: { value: 'Test reply' } });

    const sendButton = screen.getByRole('button', { name: /send reply/i });
    fireEvent.click(sendButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Reply to Query')).not.toBeInTheDocument();
    });

    // UI on the card should update
    const updatedCard = screen.getByText('Jahnavi Verma').closest('div');
    expect(updatedCard.querySelector('button')).toHaveTextContent('Reply Again');
    expect(updatedCard).toHaveTextContent('1 Reply Sent');
  });
});
