import { Request, Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware.js";
import { supabaseAdmin } from "../../config/supabase.js";

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
    const { full_name, avatar_url } = req.body;

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update({ 
        full_name,
        // Only update avatar_url if provided (and not null/undefined explicitly if we want to allow clearing it, typically we do)
        ...(avatar_url !== undefined && { avatar_url }) 
      })
      .eq("id", profileId)
      .select("id, full_name, avatar_url")
      .single();

    if (error) {
      console.error("updateProfile error:", error);
      return res.status(500).json({ success: false, error: "Failed to update profile" });
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


import axios from "axios";
import { supabaseUrl } from "../../config/supabase.js";

export const unlinkProvider = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthRequest;
    const { provider } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!provider) {
      return res.status(400).json({ success: false, error: "Provider is required" });
    }

    // Get latest user data to check identities
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (userError || !userData.user) {
      return res.status(500).json({ success: false, error: "Failed to fetch user data" });
    }

    const identities = userData.user.identities || [];
    
    // Check if we have more than 1 identity (safety check)
    if (identities.length <= 1) {
        return res.status(400).json({ success: false, error: "Cannot unlink the only login method." });
    }

    const identityToRemove = identities.find(id => id.provider === provider);

    if (!identityToRemove) {
         return res.status(400).json({ success: false, error: "Identity not found" });
    }

    // Manual API call because deleteUserIdentity is missing in current SDK version
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
    }

    await axios.delete(`${supabaseUrl}/auth/v1/admin/users/${user.id}/identities/${identityToRemove.id}`, {
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
        }
    });

    res.json({ success: true, message: "Provider unlinked successfully" });

  } catch (error: any) {
    console.error("unlinkProvider exception:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


