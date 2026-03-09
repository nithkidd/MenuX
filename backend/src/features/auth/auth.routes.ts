import { Router } from "express";
import * as authController from "./auth.controller.js";
import { verifyAuth } from "../../shared/middleware/auth.middleware.js";
import { authLimiter } from "../../shared/middleware/rateLimit.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user info
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile and role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     profileId:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyAuth, authController.getMe);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               tours_completed:
 *                 type: array
 *                 items:
 *                   type: string
 *               onboarding_completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/me", verifyAuth, authController.updateProfile);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Partially update current user profile (including tour tracking)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               tours_completed:
 *                 type: array
 *                 items:
 *                   type: string
 *               onboarding_completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch("/profile", verifyAuth, authController.updateProfile);

/**
 * @swagger
 * /auth/unlink:
 *   post:
 *     summary: Unlink a provider (identity)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider unlinked successfully
 */
router.post("/unlink", verifyAuth, authLimiter, authController.unlinkProvider);

// --- New Auth Routes ---

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 *       429:
 *         description: Too many requests
 */
router.post("/login", authLimiter, authController.login);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Signup with password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Signup successful
 *       429:
 *         description: Too many requests
 */
router.post("/signup", authLimiter, authController.signup);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Session refreshed
 *       429:
 *         description: Too many requests
 */
router.post("/refresh", authLimiter, authController.refresh);

/**
 * @swagger
 * /auth/oauth:
 *   post:
 *     summary: Get OAuth URL
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OAuth URL returned
 *       429:
 *         description: Too many requests
 */
router.post("/oauth", authLimiter, authController.oauth);

export default router;
