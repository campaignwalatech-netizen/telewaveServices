// Advanced authentication and authorization hooks
export { useAuth } from './useAuth';
export { default as useNavigation } from './useNavigation';
export { default as usePermissions } from './usePermissions';
export { default as useSession } from './useSession';

// Re-export for convenience
export {
  useAuth as default,
  useAuth as useAuthentication
};