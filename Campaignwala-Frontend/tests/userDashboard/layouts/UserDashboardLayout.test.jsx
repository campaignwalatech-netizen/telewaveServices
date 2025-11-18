import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserDashboardLayout from '../../../src/userDashboard/layouts/UserDashboardLayout';

// Mock child components to simplify testing
vi.mock('../../../src/userDashboard/components/Sidebar', () => ({
  default: ({ isSidebarOpen }) => <div data-testid="sidebar">{isSidebarOpen ? 'Sidebar Open' : 'Sidebar Closed'}</div>,
}));

vi.mock('../../../src/userDashboard/components/Navbar', () => ({
  default: ({ toggleSidebar, setDarkMode }) => (
    <div data-testid="navbar">
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={() => setDarkMode(dark => !dark)}>Toggle Dark Mode</button>
    </div>
  ),
}));

vi.mock('../../../src/userDashboard/components/Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

describe('UserDashboardLayout Component', () => {
  it('should render the layout with sidebar, navbar, footer, and outlet', () => {
    render(
      <MemoryRouter initialEntries={['/user']}>
        <Routes>
            <Route path="/user" element={<UserDashboardLayout darkMode={false} setDarkMode={() => {}} />}>
                <Route index element={<div>Dashboard Content</div>} />
            </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should toggle the sidebar when the toggle button is clicked', () => {
    render(
        <MemoryRouter initialEntries={['/user']}>
            <Routes>
                <Route path="/user" element={<UserDashboardLayout darkMode={false} setDarkMode={() => {}} />} />
            </Routes>
        </MemoryRouter>
    );

    const toggleButton = screen.getByText('Toggle Sidebar');

    // Sidebar is open by default
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Sidebar Open');

    // Click to close
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Sidebar Closed');

    // Click to open again
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Sidebar Open');
  });

  it('should call setDarkMode when the dark mode toggle is clicked', () => {
    const setDarkMode = vi.fn();
    render(
        <MemoryRouter initialEntries={['/user']}>
            <Routes>
                <Route path="/user" element={<UserDashboardLayout darkMode={false} setDarkMode={setDarkMode} />} />
            </Routes>
        </MemoryRouter>
    );

    const darkModeToggle = screen.getByText('Toggle Dark Mode');
    fireEvent.click(darkModeToggle);

    expect(setDarkMode).toHaveBeenCalledTimes(1);
  });
});