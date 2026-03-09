import { Request, Response, NextFunction } from "express";
import { supabase, supabaseAdmin } from "../../config/supabase.js";
import { AuthUser } from "../types/index.js";

export interface AuthRequest extends Request {
  user: AuthUser;
  profileId: string;
  role: string;
  requiresOwnershipCheck?: boolean;
}

export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: No token provided",
      message: "Please sign in to continue.",
    });
  }

  /* DEBUG LOGGING */
  // console.log('Auth Middleware Header:', authHeader);

  try {
    const token = authHeader.split(" ")[1];
    // Use public client (anon key) to verify user JWTs
    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      console.error("Auth Middleware: Invalid token", authError);
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid token",
        message: "Your session is invalid or expired. Please sign in again.",
      });
    }

    const authUser = authData.user;
    // Use admin client for database operations (bypasses RLS)
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, auth_user_id, email, full_name, avatar_url, role, tours_completed, onboarding_completed",
      )
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (!profile && authUser.email) {
      const { data: legacyProfile } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, auth_user_id, email, full_name, avatar_url, role, tours_completed, onboarding_completed",
        )
        .eq("email", authUser.email)
        .is("auth_user_id", null)
        .maybeSingle();

      if (legacyProfile) {
        const { data: updatedProfile } = await supabaseAdmin
          .from("profiles")
          .update({ auth_user_id: authUser.id })
          .eq("id", legacyProfile.id)
          .select(
            "id, auth_user_id, email, full_name, avatar_url, role, tours_completed, onboarding_completed",
          )
          .single();

        profile = updatedProfile;
      }
    }

    // Log metadata for debugging
    console.log(
      `[Auth] User Metadata for ${authUser.email}:`,
      authUser.user_metadata,
    );

    const metadata = authUser.user_metadata || {};
    const metaName =
      metadata.full_name || metadata.name || metadata.experiment_name || null;
    const metaAvatar =
      metadata.avatar_url || metadata.picture || metadata.avatar || null;

    if (!profile) {
      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email || "",
          full_name: metaName,
          avatar_url: metaAvatar,
        })
        .select(
          "id, auth_user_id, email, full_name, avatar_url, role, tours_completed, onboarding_completed",
        )
        .single();

      if (createError || !createdProfile) {
        console.error("Auth Middleware: Profile create error", createError);
        return res.status(500).json({
          success: false,
          error: "Failed to initialize profile",
          message: "Unable to initialize your profile right now.",
        });
      }

      profile = createdProfile;
    }

    const user: AuthUser = {
      id: authUser.id,
      email: authUser.email || "",
      // Prioritize DB profile data over Supabase metadata, with robust fallbacks
      full_name: profile.full_name || metaName || null,
      avatar_url: profile.avatar_url || metaAvatar || null,
      identities: authUser.identities,
    };

    (req as AuthRequest).user = user;
    (req as AuthRequest).profileId = profile.id;
    (req as AuthRequest).role = profile.role || "user";
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error during auth",
      message: "Authentication failed due to a server error.",
    });
  }
};
