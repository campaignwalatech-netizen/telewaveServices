import * as routeConstants from '@/routes/routeConstants';

describe('routeConstants', () => {
  it('should have PUBLIC_ROUTES defined', () => {
    expect(routeConstants.PUBLIC_ROUTES).toBeDefined();
    expect(Object.values(routeConstants.PUBLIC_ROUTES).every(v => typeof v === 'string')).toBe(true);
  });

  it('should have ADMIN_ROUTES defined', () => {
    expect(routeConstants.ADMIN_ROUTES).toBeDefined();
    expect(Object.values(routeConstants.ADMIN_ROUTES).every(v => typeof v === 'string' || typeof v === 'object')).toBe(true);
  });

  it('should have USER_ROUTES defined', () => {
    expect(routeConstants.USER_ROUTES).toBeDefined();
    expect(Object.values(routeConstants.USER_ROUTES).every(v => typeof v === 'string' || typeof v === 'object')).toBe(true);
  });

  it('should have DEFAULT_REDIRECTS for all roles', () => {
    expect(routeConstants.DEFAULT_REDIRECTS.admin).toBeDefined();
    expect(routeConstants.DEFAULT_REDIRECTS.user).toBeDefined();
    expect(routeConstants.DEFAULT_REDIRECTS.guest).toBeDefined();
  });

  it('should have NAVIGATION_MENU for admin and user', () => {
    expect(routeConstants.NAVIGATION_MENU.ADMIN).toBeInstanceOf(Array);
    expect(routeConstants.NAVIGATION_MENU.USER).toBeInstanceOf(Array);
  });

  it('should have valid navigation menu items', () => {
    const validateMenuItem = (item) => {
      expect(item).toHaveProperty('key');
      expect(item).toHaveProperty('label');
      if (item.children) {
        item.children.forEach(validateMenuItem);
      } else {
        expect(item).toHaveProperty('path');
      }
    };

    routeConstants.NAVIGATION_MENU.ADMIN.forEach(validateMenuItem);
    routeConstants.NAVIGATION_MENU.USER.forEach(validateMenuItem);
  });
});
