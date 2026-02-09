import { Router } from "express";
import * as authController from "./auth.controller.js";
import { verifyAuth } from "../../shared/middleware/auth.middleware.js";

const router = Router();

router.get("/me", verifyAuth, authController.getMe);

export default router;
