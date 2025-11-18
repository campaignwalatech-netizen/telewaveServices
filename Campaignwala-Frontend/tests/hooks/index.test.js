import {
  useAuth,
  useNavigation,
  usePermissions,
  useSession,
  useAuthentication,
} from '@/hooks/index';

import { useAuth as useAuthSrc } from '@/hooks/useAuth';
import useNavigationSrc from '@/hooks/useNavigation';
import usePermissionsSrc from '@/hooks/usePermissions';
import useSessionSrc from '@/hooks/useSession';

describe('hooks index', () => {
  it('should export useAuth correctly', () => {
    expect(useAuth).toBe(useAuthSrc);
  });

  it('should export useNavigation correctly', () => {
    expect(useNavigation).toBe(useNavigationSrc);
  });

  it('should export usePermissions correctly', () => {
    expect(usePermissions).toBe(usePermissionsSrc);
  });

  it('should export useSession correctly', () => {
    expect(useSession).toBe(useSessionSrc);
  });

  it('should re-export useAuth as useAuthentication', () => {
    expect(useAuthentication).toBe(useAuthSrc);
  });
});
