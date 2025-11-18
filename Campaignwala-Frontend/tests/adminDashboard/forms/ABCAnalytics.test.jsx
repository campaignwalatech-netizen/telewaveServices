
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnalyticsDashboard from '../../../src/adminDashboard/forms/ABCAnalytics';

// Mock the recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div />, 
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

describe('AnalyticsDashboard Component', () => {
  it('should render the main dashboard title', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('should render filter dropdowns', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('All Customers')).toBeInTheDocument();
  });

  it('should render initial metrics cards', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('DateWise Count')).toBeInTheDocument();
    expect(screen.getByText('2591')).toBeInTheDocument(); // Total Count for All Customers
  });

  it('should open the calendar on date range click', () => {
    render(<AnalyticsDashboard />);
    const dateRangeButton = screen.getByText(/2025-09-25/);
    fireEvent.click(dateRangeButton);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('should update metrics when a different customer is selected', () => {
    render(<AnalyticsDashboard />);
    const customerDropdown = screen.getByText('All Customers').closest('select');
    fireEvent.change(customerDropdown, { target: { value: 'Abhinandan Shukla' } });

    // Check if the metrics updated
    expect(screen.getByText('3200')).toBeInTheDocument(); // Total Count for Abhinandan Shukla
    expect(screen.getByText('2800')).toBeInTheDocument(); // Pending for Abhinandan Shukla
  });

  it('should render chart titles', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Date Wise Account Created')).toBeInTheDocument();
    expect(screen.getByText('Pending Account 2586')).toBeInTheDocument();
    expect(screen.getByText('Total Pending Account 36296')).toBeInTheDocument();
    expect(screen.getByText('Total Approved Account 2294')).toBeInTheDocument();
  });
});
