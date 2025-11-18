import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminHeader from '../../../src/adminDashboard/components/AdminHeader';
import { useTheme } from '../../../src/context-api/ThemeContext';

// Mock the useTheme hook
vi.mock('../../../src/context-api/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Menu: () => <div data-testid="menu-icon" />,
    Sun: () => <div data-testid="sun-icon" />,
    Moon: () => <div data-testid="moon-icon" />,
  };
});

describe('AdminHeader Component', () => {
  const setSidebarOpen = vi.fn();

  // Clear mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header with the title', () => {
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: () => {} });
    render(<AdminHeader setSidebarOpen={setSidebarOpen} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should call setSidebarOpen on mobile menu click', () => {
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: () => {} });
    render(<AdminHeader setSidebarOpen={setSidebarOpen} />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('should call toggleTheme on theme button click', () => {
    const toggleTheme = vi.fn();
    useTheme.mockReturnValue({ theme: 'light', toggleTheme });
    render(<AdminHeader setSidebarOpen={setSidebarOpen} />);
    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should display the Moon icon in light mode', () => {
    useTheme.mockReturnValue({ theme: 'light', toggleTheme: () => {} });
    render(<AdminHeader setSidebarOpen={setSidebarOpen} />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('should display the Sun icon in dark mode', () => {
    useTheme.mockReturnValue({ theme: 'dark', toggleTheme: () => {} });
    render(<AdminHeader setSidebarOpen={setSidebarOpen} />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });
});