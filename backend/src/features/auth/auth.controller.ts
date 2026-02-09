import { Request, Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware.js";

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
