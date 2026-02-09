/**
 * Admin Routes
 *
 * All routes require admin or super_admin role.
 * User management routes require super_admin.
 */

import { Router } from "express";
import { can, requireRole } from "../../shared/middleware/rbac.middleware.js";
import * as adminController from "./admin.controller.js";

const router = Router();

// ─── Dashboard (admin+) ────────────────────────────────────────────
router.get("/stats", can("read", "admin_dashboard"), adminController.getStats);

// ─── Business Management (admin+) ──────────────────────────────────
router.get(
  "/businesses",
  can("read", "business"),
  adminController.listBusinesses,
);
router.patch(
  "/businesses/:id/toggle",
  can("update", "business"),
  adminController.toggleBusiness,
);
router.delete(
  "/businesses/:id",
  can("delete", "business"),
  adminController.deleteBusiness,
);

// ─── User Management (super_admin only) ─────────────────────────────
router.get("/users", requireRole("super_admin"), adminController.listUsers);
router.patch(
  "/users/:id/role",
  requireRole("super_admin"),
  adminController.updateRole,
);
router.delete(
  "/users/:id",
  requireRole("super_admin"),
  adminController.deleteUser,
);
router.post(
  "/users/invite",
  requireRole("super_admin"),
  adminController.inviteUser,
);

export default router;
