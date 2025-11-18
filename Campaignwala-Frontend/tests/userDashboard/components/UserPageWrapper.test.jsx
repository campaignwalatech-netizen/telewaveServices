
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserPageWrapper from '../../../src/userDashboard/components/UserPageWrapper';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../../src/userDashboard/components/Navbar', () => ({ default: () => <div>Navbar</div> }));
vi.mock('../../../src/userDashboard/components/Sidebar', () => ({ default: () => <div>Sidebar</div> }));
vi.mock('../../../src/userDashboard/components/Footer', () => ({ default: () => <div>Footer</div> }));

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

describe('UserPageWrapper Component', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ChildComponent = () => <div>Child Content</div>;
  const LoginPage = () => <div>LoginPage</div>;

  const renderInRouter = (initialEntries = ['/user/dashboard']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/user/dashboard" element={<UserPageWrapper><ChildComponent /></UserPageWrapper>} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render layout and children for authenticated user', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'user');

    renderInRouter();
    
    act(() => {
        vi.runAllTimers();
    });

    await waitFor(() => {
        expect(screen.getByText('Navbar')).toBeInTheDocument();
        expect(screen.getByText('Sidebar')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to login if not logged in', async () => {
    renderInRouter();
    
    act(() => {
        vi.runAllTimers();
    });

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should redirect to login if userType is not \'user\'', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'admin');

    renderInRouter();
    
    act(() => {
        vi.runAllTimers();
    });

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should initialize in dark mode if theme is set in localStorage', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userType', 'user');

    const { container } = renderInRouter();

    act(() => {
        vi.runAllTimers();
    });

    expect(container.firstChild).toHaveClass('dark');
  });
});
