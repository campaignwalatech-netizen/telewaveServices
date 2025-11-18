
import * as exports from '../../../src/userDashboard/pages/index';
import UserDashboardLayout from '../../../src/userDashboard/layouts/UserDashboardLayout';

describe('userDashboard pages index', () => {
  it('should export UserDashboardLayout', () => {
    expect(exports.UserDashboardLayout).toBe(UserDashboardLayout);
  });
});
