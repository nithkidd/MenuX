import { Router } from "express";
import * as authController from "./auth.controller.js";
import { verifyAuth } from "../../shared/middleware/auth.middleware.js";

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
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/me", verifyAuth, authController.updateProfile);

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
router.post("/unlink", verifyAuth, authController.unlinkProvider);


export default router;
