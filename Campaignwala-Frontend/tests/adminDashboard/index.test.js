import {
  DashboardPage,
  UsersPage,
  OffersPage,
  AdminSidebar,
  AdminHeader,
  StatsCard,
  ActivityFeed,
} from '@/adminDashboard/index';

import DashboardPageSrc from '@/adminDashboard/pages/DashboardPage';
import UsersPageSrc from '@/adminDashboard/pages/UsersPage';
// Assuming OffersPage is in pages, adjust if necessary
// import OffersPageSrc from '@/adminDashboard/pages/OffersPage';

import AdminSidebarSrc from '@/adminDashboard/components/AdminSidebar';
import AdminHeaderSrc from '@/adminDashboard/components/AdminHeader';
import StatsCardSrc from '@/adminDashboard/components/StatsCard';
import ActivityFeedSrc from '@/adminDashboard/components/ActivityFeed';

describe('adminDashboard index', () => {
  it('should export DashboardPage correctly', () => {
    expect(DashboardPage).toBe(DashboardPageSrc);
  });

  it('should export UsersPage correctly', () => {
    expect(UsersPage).toBe(UsersPageSrc);
  });

  // it('should export OffersPage correctly', () => {
  //   expect(OffersPage).toBe(OffersPageSrc);
  // });

  it('should export AdminSidebar correctly', () => {
    expect(AdminSidebar).toBe(AdminSidebarSrc);
  });

  it('should export AdminHeader correctly', () => {
    expect(AdminHeader).toBe(AdminHeaderSrc);
  });

  it('should export StatsCard correctly', () => {
    expect(StatsCard).toBe(StatsCardSrc);
  });

  it('should export ActivityFeed correctly', () => {
    expect(ActivityFeed).toBe(ActivityFeedSrc);
  });
});
