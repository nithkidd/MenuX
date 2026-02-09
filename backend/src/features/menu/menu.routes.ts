import { Router } from 'express';
import { menuController } from './menu.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Public menu access
 */

/**
 * @swagger
 * /menu/{slug}:
 *   get:
 *     summary: Get public menu by business slug
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The business slug
 *     responses:
 *       200:
 *         description: Public menu data including categories and items
 *       404:
 *         description: Menu not found
 */
// Public route - no auth required
router.get('/:slug', (req, res) => menuController.getBySlug(req, res));

export default router;
