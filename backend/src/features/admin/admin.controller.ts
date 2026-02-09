/**
 * Admin Controller
 *
 * Handles HTTP request/response for admin operations.
 */

import { Request, Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware.js";
import * as adminService from "./admin.service.js";
import { ApiResponse } from "../../shared/types/index.js";

// ─── Dashboard Stats ────────────────────────────────────────────────

export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats } as ApiResponse);
  } catch (error) {
    console.error("Admin getStats error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch stats" } as ApiResponse);
  }
}

// ─── Business Management ────────────────────────────────────────────

export async function listBusinesses(_req: Request, res: Response) {
  try {
    const businesses = await adminService.listAllBusinesses();
    res.json({ success: true, data: businesses } as ApiResponse);
  } catch (error) {
    console.error("Admin listBusinesses error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch businesses",
      } as ApiResponse);
  }
}

export async function toggleBusiness(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      res
        .status(400)
        .json({
          success: false,
          error: "is_active (boolean) is required",
        } as ApiResponse);
      return;
    }

    const business = await adminService.toggleBusinessActive(id, is_active);
    res.json({
      success: true,
      data: business,
      message: `Business ${is_active ? "activated" : "deactivated"}`,
    } as ApiResponse);
  } catch (error) {
    console.error("Admin toggleBusiness error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update business",
      } as ApiResponse);
  }
}

export async function deleteBusiness(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await adminService.deleteBusiness(id);
    res.json({ success: true, message: "Business deleted" } as ApiResponse);
  } catch (error) {
    console.error("Admin deleteBusiness error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to delete business",
      } as ApiResponse);
  }
}

// ─── User Management (Super Admin) ─────────────────────────────────

export async function listUsers(_req: Request, res: Response) {
  try {
    const users = await adminService.listAllUsers();
    res.json({ success: true, data: users } as ApiResponse);
  } catch (error) {
    console.error("Admin listUsers error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch users" } as ApiResponse);
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    const authReq = req as AuthRequest;

    if (!role) {
      res
        .status(400)
        .json({ success: false, error: "role is required" } as ApiResponse);
      return;
    }

    // Prevent super_admin from demoting themselves
    if (id === authReq.profileId) {
      res
        .status(400)
        .json({
          success: false,
          error: "Cannot change your own role",
        } as ApiResponse);
      return;
    }

    const updated = await adminService.updateUserRole(id, role);
    res.json({
      success: true,
      data: updated,
      message: `Role updated to ${role}`,
    } as ApiResponse);
  } catch (error) {
    console.error("Admin updateRole error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to update role";
    res.status(400).json({ success: false, error: msg } as ApiResponse);
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const authReq = req as AuthRequest;

    // Prevent deleting yourself
    if (id === authReq.profileId) {
      res
        .status(400)
        .json({
          success: false,
          error: "Cannot delete your own account",
        } as ApiResponse);
      return;
    }

    await adminService.deleteUser(id);
    res.json({ success: true, message: "User deleted" } as ApiResponse);
  } catch (error: any) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete user",
      details: error, // Return full error object for debugging
    } as ApiResponse);
  }
}

export async function inviteUser(req: Request, res: Response) {
  try {
    const { email, role } = req.body;

    if (!email) {
      res
        .status(400)
        .json({ success: false, error: "email is required" } as ApiResponse);
      return;
    }

    const result = await adminService.inviteUser(email, role || "user");
    res
      .status(201)
      .json({
        success: true,
        data: result,
        message: "Invitation sent",
      } as ApiResponse);
  } catch (error: any) {
    console.error("Admin inviteUser error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to invite user",
      details: error,
    } as ApiResponse);
  }
}
