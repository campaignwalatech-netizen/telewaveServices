import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import App from '../src/App';
import { updateLastActivity } from '../src/redux/slices/authSlice';

// Mock child components
vi.mock('../src/adminDashboard/components/Sidebar', () => ({
  default: () => <aside>Sidebar</aside>,
}));

vi.mock('../src/adminDashboard/components/Header', () => ({
  default: ({ onThemeToggle }) => (
    <header>
      <button onClick={onThemeToggle}>Toggle Theme</button>
    </header>
  ),
}));

// Mock react-router-dom Outlet
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Outlet: () => <div>Outlet Content</div>,
    };
});

const mockStore = configureStore([]);

describe('App.jsx', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'admin' },
      },
    });
    store.dispatch = vi.fn();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    );

  it('renders the main layout with Sidebar, Header, and Outlet', () => {
    renderComponent();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle Theme' })).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });

  it('initializes theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    renderComponent();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme when header button is clicked', () => {
    renderComponent();
    // Initially light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');

    // Toggle to dark
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('dispatches updateLastActivity on user interaction', () => {
    renderComponent();
    
    // Simulate a user click event on the main container
    fireEvent.mouseDown(screen.getByText('Outlet Content'));

    expect(store.dispatch).toHaveBeenCalledWith(updateLastActivity());
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderComponent();

    unmount();

    // Check if removeEventListener was called for the events
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), true);
  });
});