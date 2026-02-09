/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities for React components.
 * Uses the current user's role from auth context.
 */

import { useMemo } from 'react';
import { useAuth } from '../../features/auth/auth.context';
import { hasPermission } from '../rbac/permissions';
import type { Action, Resource, Role } from '../rbac/permissions';

export interface UsePermissionsReturn {
  /** Check if user has permission for action on resource */
  can: (action: Action, resource: Resource, isOwn?: boolean) => boolean;
  /** Check if user has any of the specified roles */
  hasRole: (...roles: Role[]) => boolean;
  /** Check if user is admin or super_admin */
  isAdmin: boolean;
  /** Check if user is super_admin */
  isSuperAdmin: boolean;
  /** Current user role */
  role: Role;
}

/**
 * Hook to check user permissions in React components.
 * 
 * @example
 * const { can, isAdmin } = usePermissions();
 * 
 * // In render:
 * {can('delete', 'user') && <DeleteUserButton />}
 * {isAdmin && <AdminDashboardLink />}
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const role: Role = (user?.role as Role) || 'user';

  return useMemo(() => ({
    can: (action: Action, resource: Resource, isOwn = false) => 
      hasPermission(role, action, resource, isOwn),
    
    hasRole: (...roles: Role[]) => roles.includes(role),
    
    isAdmin: role === 'admin' || role === 'super_admin',
    
    isSuperAdmin: role === 'super_admin',
    
    role,
  }), [role]);
}
