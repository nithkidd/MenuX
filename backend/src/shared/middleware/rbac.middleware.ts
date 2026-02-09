/**
 * RBAC Middleware
 * 
 * Provides permission-based access control middleware for Express routes.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { hasPermission, Action, Resource, Role, PROTECTED_FIELDS } from '../rbac/permissions.js';

/**
 * Middleware factory to check if user has permission for an action on a resource.
 * 
 * @example
 * // Protect a route requiring 'delete' permission on 'user' resource
 * router.delete('/users/:id', verifyAuth, can('delete', 'user'), deleteUser);
 */
export const can = (action: Action, resource: Resource) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const role = (authReq.role || 'user') as Role;

    // For :own scoped permissions, we need to determine ownership
    // First check global permission
    if (hasPermission(role, action, resource, false)) {
      return next();
    }

    // Check :own permission - ownership validation should be done in route handler
    // We mark the request to indicate :own check is required
    if (hasPermission(role, action, resource, true)) {
      authReq.requiresOwnershipCheck = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: `You do not have permission to ${action} this ${resource}`,
    });
  };
};

/**
 * Middleware to require a minimum role level.
 * Use sparingly - prefer can() for specific permissions.
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const role = (authReq.role || 'user') as Role;

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient role',
      message: 'You do not have the required role for this action',
    });
  };
};

/**
 * Middleware to strip protected fields from request body.
 * Prevents users from modifying sensitive fields like 'role', 'id', etc.
 */
export const stripProtectedFields = (resource: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const protectedFields = PROTECTED_FIELDS[resource] || [];
    
    for (const field of protectedFields) {
      if (req.body && field in req.body) {
        delete req.body[field];
      }
    }
    
    next();
  };
};

// Note: AuthRequest type is extended in auth.middleware.ts
