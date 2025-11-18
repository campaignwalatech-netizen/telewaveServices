
import navigationService from '../../../src/services/navigationService';
import { PUBLIC_ROUTES, ADMIN_ROUTES, USER_ROUTES, DEFAULT_REDIRECTS, NAVIGATION_MENU } from '../../../src/routes/routeConstants';

// Mock routeConstants
jest.mock('../../../src/routes/routeConstants', () => ({
  PUBLIC_ROUTES: { LOGIN: '/login', HOME: '/' },
  ADMIN_ROUTES: { DASHBOARD: '/admin/dashboard', USERS: '/admin/users' },
  USER_ROUTES: { DASHBOARD: '/user/dashboard' },
  DEFAULT_REDIRECTS: { admin: '/admin/dashboard', user: '/user/dashboard', guest: '/login' },
  NAVIGATION_MENU: {
    ADMIN: [{ key: 'dashboard', path: '/admin/dashboard', label: 'Dashboard' }],
    USER: [{ key: 'dashboard', path: '/user/dashboard', label: 'Dashboard' }],
  },
}));

describe('navigationService', () => {
  beforeEach(() => {
    navigationService.clearHistory();
    sessionStorage.clear();
  });

  it('should return the correct navigation menu for a role', () => {
    expect(navigationService.getNavigationMenu('admin')).toEqual(NAVIGATION_MENU.ADMIN);
    expect(navigationService.getNavigationMenu('user')).toEqual(NAVIGATION_MENU.USER);
    expect(navigationService.getNavigationMenu('guest')).toEqual([]);
  });

  it('should return the correct default route for a role', () => {
    expect(navigationService.getDefaultRoute('admin')).toBe(DEFAULT_REDIRECTS.admin);
    expect(navigationService.getDefaultRoute('user')).toBe(DEFAULT_REDIRECTS.user);
    expect(navigationService.getDefaultRoute('guest')).toBe(DEFAULT_REDIRECTS.guest);
  });

  it('should correctly check if a user can access a route', () => {
    expect(navigationService.canAccessRoute(PUBLIC_ROUTES.LOGIN, 'guest')).toBe(true);
    expect(navigationService.canAccessRoute(ADMIN_ROUTES.DASHBOARD, 'admin')).toBe(true);
    expect(navigationService.canAccessRoute(ADMIN_ROUTES.DASHBOARD, 'user')).toBe(false);
    expect(navigationService.canAccessRoute(USER_ROUTES.DASHBOARD, 'user')).toBe(true);
  });

  it('should manage intended route in sessionStorage', () => {
    const route = '/some/intended/route';
    navigationService.setIntendedRoute(route);
    expect(sessionStorage.getItem('intendedRoute')).toBe(route);
    const retrievedRoute = navigationService.getIntendedRoute();
    expect(retrievedRoute).toBe(route);
    expect(sessionStorage.getItem('intendedRoute')).toBe(null);
  });

  it('should manage navigation history', () => {
    navigationService.addToHistory('/');
    navigationService.addToHistory('/about');
    expect(navigationService.getHistory()).toHaveLength(2);
    navigationService.clearHistory();
    expect(navigationService.getHistory()).toHaveLength(0);
  });
});
