
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../../src/userDashboard/components/Navbar';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => (store[key] = value.toString()),
    clear: () => (store = {}),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('User Dashboard Navbar Component', () => {
  let setDarkMode, toggleSidebar;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setDarkMode = vi.fn();
    toggleSidebar = vi.fn();
  });

  const renderComponent = (darkMode = false) => {
    return render(
      <MemoryRouter>
        <Navbar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          toggleSidebar={toggleSidebar} 
        />
      </MemoryRouter>
    );
  };

  it('should render the navbar with logo, search, and icons', () => {
    renderComponent();
    expect(screen.getByText('Freelancewala')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search offers/i)).toBeInTheDocument();
    expect(screen.getByTitle(/notifications/i)).toBeInTheDocument();
    expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument();
  });

  it('should call setDarkMode when theme toggle is clicked', () => {
    renderComponent(false);
    fireEvent.click(screen.getByTitle(/switch to dark mode/i));
    expect(setDarkMode).toHaveBeenCalledWith(true);
  });

  it('should call toggleSidebar when mobile menu button is clicked', () => {
    renderComponent();
    // The hamburger menu is hidden on desktop, so we need to find it differently
    const toggleButton = screen.getByRole('button', { name: '' }); // This is not ideal, but the button has no text
    fireEvent.click(toggleButton);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should open and close the profile menu', () => {
    renderComponent();
    const profileAvatar = screen.getByRole('button', { name: '' }); // Again, not ideal
    // This is a better way to get the avatar
    const avatar = profileAvatar.querySelector('div > svg.text-white');

    // Open menu
    fireEvent.click(avatar.parentElement);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Close menu by clicking outside
    fireEvent.mouseDown(document);
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('should navigate to profile page when profile button is clicked', () => {
    renderComponent();
    const profileAvatar = screen.getByRole('button', { name: '' });
    const avatar = profileAvatar.querySelector('div > svg.text-white');
    fireEvent.click(avatar.parentElement);

    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/profile');
  });

  it('should clear localStorage and navigate to login on logout', () => {
    localStorage.setItem('isLoggedIn', 'true');
    renderComponent();
    const profileAvatar = screen.getByRole('button', { name: '' });
    const avatar = profileAvatar.querySelector('div > svg.text-white');
    fireEvent.click(avatar.parentElement);

    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to notifications page when bell icon is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTitle(/notifications/i));
    expect(mockNavigate).toHaveBeenCalledWith('/user/notification-page');
  });

  it('should show mobile search bar on icon click', () => {
    renderComponent();
    const mobileSearchButton = screen.getByRole('button', { name: '' }); // Needs better selector
    const searchIcon = mobileSearchButton.querySelector('svg.text-gray-700');
    fireEvent.click(searchIcon);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
