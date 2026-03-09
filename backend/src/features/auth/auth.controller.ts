import { Request, Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware.js";
import { supabaseAdmin, supabaseUrl } from "../../config/supabase.js";
import { authService } from "./auth.service.js"; // Import AuthService
import axios from "axios";

// --- Existing methods (getMe, updateProfile) ---

export const getMe = async (req: Request, res: Response) => {
  try {
    const { user, profileId, role } = req as AuthRequest;

    if (!user) {
      console.error("getMe: No user in req");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    res.json({
      success: true,
      data: { user, profileId, role: role || "user" },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req as AuthRequest;
    const { full_name, avatar_url, tours_completed, onboarding_completed } =
      req.body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (tours_completed !== undefined)
      updateData.tours_completed = tours_completed;
    if (onboarding_completed !== undefined)
      updateData.onboarding_completed = onboarding_completed;

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", profileId)
      .select(
        "id, auth_user_id, email, full_name, avatar_url, role, tours_completed, onboarding_completed",
      )
      .single();

    if (error) {
      console.error("updateProfile error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update profile" });
    }

    res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("updateProfile exception:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unlinkProvider = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { provider } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!provider) {
      return res
        .status(400)
        .json({ success: false, error: "Provider is required" });
    }

    // Get latest user data to check identities
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(user.id);

    if (userError || !userData.user) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch user data" });
    }

    const identities = userData.user.identities || [];

    // Check if we have more than 1 identity (safety check)
    if (identities.length <= 1) {
      return res.status(400).json({
        success: false,
        error: "Cannot unlink the only login method.",
      });
    }

    const identityToRemove = identities.find((id) => id.provider === provider);

    if (!identityToRemove) {
      return res
        .status(400)
        .json({ success: false, error: "Identity not found" });
    }

    // Manual API call because deleteUserIdentity is missing in current SDK version
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
    }

    await axios.delete(
      `${supabaseUrl}/auth/v1/admin/users/${user.id}/identities/${identityToRemove.id}`,
      {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      },
    );

    res.json({ success: true, message: "Provider unlinked successfully" });
  } catch (error: any) {
    console.error("unlinkProvider exception:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- New Authentication Methods ---

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginWithPassword(email, password);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    const data = await authService.signupWithPassword(
      email,
      password,
      full_name,
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      // Note: supabase.auth.signOut() on backend doesn't quite invalidate the JWT immediately
      // unless we use admin.signOut(jwt). But let's try standard approach or just client side clear.
      // Ideally we should blacklist the token but Supabase handles this via expiry.
      // We will just return success.
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res
        .status(400)
        .json({ success: false, error: "Refresh token required" });
    }
    const data = await authService.refreshSession(refresh_token);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
};

export const oauth = async (req: Request, res: Response) => {
  try {
    const { provider, redirectTo } = req.body;
    const data = await authService.getOAuthUrl(provider, redirectTo);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
