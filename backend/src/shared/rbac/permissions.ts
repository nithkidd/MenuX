/**
 * RBAC Permissions Configuration
 * 
 * This file defines all roles, resources, actions, and the permission matrix.
 * Single source of truth for authorization across the application.
 */

// Available roles in the system
export type Role = 'user' | 'admin' | 'super_admin';

// Resources that can be accessed
export type Resource = 
  | 'business'
  | 'category'
  | 'item'
  | 'profile'
  | 'user'
  | 'admin_dashboard';

// Actions that can be performed
export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage';  // Full control including admin operations

// Permission can be global or scoped to own resources
export type Permission = Action | `${Action}:own`;

// Permission matrix: role -> resource -> allowed permissions
export const PERMISSIONS: Record<Role, Partial<Record<Resource, Permission[]>>> = {
  user: {
    business:   ['create', 'read:own', 'update:own', 'delete:own'],
    category:   ['create', 'read:own', 'update:own', 'delete:own'],
    item:       ['create', 'read:own', 'update:own', 'delete:own'],
    profile:    ['read:own', 'update:own'],
  },
  admin: {
    business:        ['create', 'read', 'update', 'delete'],
    category:        ['create', 'read', 'update', 'delete'],
    item:            ['create', 'read', 'update', 'delete'],
    profile:         ['read', 'update'],
    user:            ['read'],
    admin_dashboard: ['read'],
  },
  super_admin: {
    business:        ['create', 'read', 'update', 'delete', 'manage'],
    category:        ['create', 'read', 'update', 'delete', 'manage'],
    item:            ['create', 'read', 'update', 'delete', 'manage'],
    profile:         ['create', 'read', 'update', 'delete'],
    user:            ['create', 'read', 'update', 'delete', 'manage'],
    admin_dashboard: ['read', 'manage'],
  },
};

// Role hierarchy for inheritance (higher index = more permissions)
export const ROLE_HIERARCHY: Role[] = ['user', 'admin', 'super_admin'];

/**
 * Check if a role has a specific permission on a resource.
 * Supports both global permissions (e.g., 'read') and scoped permissions (e.g., 'read:own').
 * 
 * @param role - User's role
 * @param action - Action to check
 * @param resource - Resource to check against
 * @param isOwn - Whether the resource belongs to the user (for :own scoped permissions)
 * @returns true if permission is granted
 */
export function hasPermission(
  role: Role,
  action: Action,
  resource: Resource,
  isOwn: boolean = false
): boolean {
  const permissions = PERMISSIONS[role]?.[resource];
  if (!permissions) return false;

  // Check for global permission (e.g., 'read', 'manage')
  if (permissions.includes(action)) return true;
  if (permissions.includes('manage')) return true;  // 'manage' implies all actions

  // Check for scoped permission if resource is owned by user
  if (isOwn && permissions.includes(`${action}:own` as Permission)) return true;

  return false;
}

/**
 * Get all permissions for a role on a resource
 */
export function getPermissions(role: Role, resource: Resource): Permission[] {
  return PERMISSIONS[role]?.[resource] || [];
}

/**
 * Check if a role is at least at a certain level in the hierarchy
 */
export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}

/**
 * Protected fields that users cannot modify for each resource
 */
export const PROTECTED_FIELDS: Record<string, string[]> = {
  profile: ['id', 'auth_user_id', 'role', 'created_at'],
  business: ['id', 'owner_id', 'created_at'],
  user: ['id', 'role', 'created_at'],
};
